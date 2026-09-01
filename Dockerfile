# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* are inlined into the JS bundle here, not read at runtime.
# Public values only: anything passed here is readable in the shipped
# bundle and in `docker history`. Never a Supabase service-role key.
ARG VITE_ACTIVITY_SOURCE=supabase
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_ACTIVITIES_TABLE=oshwdem_activity
ARG VITE_PRETALX_BASE_URL=https://pretalx.com/api/events
ARG VITE_PRETALX_EVENT=oshwdem-2026
ARG VITE_EVENT_START_EPOCH
ENV VITE_ACTIVITY_SOURCE=$VITE_ACTIVITY_SOURCE \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_ACTIVITIES_TABLE=$VITE_SUPABASE_ACTIVITIES_TABLE \
    VITE_PRETALX_BASE_URL=$VITE_PRETALX_BASE_URL \
    VITE_PRETALX_EVENT=$VITE_PRETALX_EVENT \
    VITE_EVENT_START_EPOCH=$VITE_EVENT_START_EPOCH

# `npm run build` is `tsc -b && vite build` — a type error fails the image
RUN npm run build

# ---- serve ----
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
