# Server deployment files

These files are **not used by the app build**. They describe the server side of
the pipeline and are version-controlled here so they have history; they are
copied to the server once, by hand.

| File | Goes to |
|---|---|
| `compose.yaml` | `/opt/oshwdem-live/compose.yaml` |
| `env.example` | `/opt/oshwdem-live/.env` (filled in) |
| `deploy.sh` | `/opt/oshwdem-live/deploy.sh` (`chmod +x`) |
| `Caddyfile.snippet` | appended to the existing mounted Caddyfile |

## How it fits together

GitHub Actions builds an image on every push and tags it `sha-<short>`. The
`Deploy` workflow SSHes in with a key pinned to `deploy.sh` as a forced
command; that script rewrites one tag in `.env` and restarts one service.

`prod` and `dev` run the *same image*. Promotion is redeploying a tag already
verified on dev, so what reaches production is byte-identical to what you
tested. Rollback is the same button with an older tag.

## One-time setup

**1. DNS** — point both names at the server, and wait for propagation before
touching Caddy; it cannot issue certificates until they resolve.

```
live.oshwdem.org       A    <server-ip>
live-dev.oshwdem.org   A    <server-ip>
```

**2. Find Caddy's network and Caddyfile**

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep -i caddy
CADDY=<name-from-above>
docker inspect "$CADDY" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}'
docker inspect "$CADDY" --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
```

**3. Install the files** (from your laptop, in this directory)

```bash
ssh <user>@<server> 'sudo mkdir -p /opt/oshwdem-live && sudo chown $USER /opt/oshwdem-live'
scp compose.yaml deploy.sh <user>@<server>:/opt/oshwdem-live/
scp env.example <user>@<server>:/opt/oshwdem-live/.env
ssh <user>@<server> 'chmod +x /opt/oshwdem-live/deploy.sh'
```

Then edit `/opt/oshwdem-live/.env` and set `CADDY_NETWORK` to the network from
step 2.

**4. Registry access.** Images published by Actions are **private by default**,
so `docker compose pull` will 401 until the server can authenticate. Pick one:

*Public package* — nothing to install on the server. GitHub → your profile →
Packages → `oshwdem-web` → Package settings → Change visibility → Public.

*Keep it private* — create a PAT (classic) scoped to `read:packages` only, then
log in **as the same user the deploy key authenticates as**, since the
credentials land in that user's `~/.docker/config.json` and `deploy.sh` runs as
them:

```bash
echo '<pat>' | docker login ghcr.io -u manuelsrleon --password-stdin
```

The package does not exist until the first `Build image` run succeeds, so do
this once you have a tag, and check it before wiring up the deploy key:

```bash
docker pull ghcr.io/manuelsrleon/oshwdem-web:sha-<short>
```

**5. Caddy** — generate a password hash for the dev site:

```bash
docker exec "$CADDY" caddy hash-password --plaintext 'pick-a-password'
```

Paste the blocks from `Caddyfile.snippet` (with the hash substituted) onto the
end of the mounted Caddyfile, then — validate *before* reloading, since a
malformed Caddyfile takes down every other site on the box:

```bash
docker exec "$CADDY" caddy validate --config /etc/caddy/Caddyfile
docker exec "$CADDY" caddy reload  --config /etc/caddy/Caddyfile
```

**6. Restricted deploy key.** On your laptop:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oshwdem-deploy -C "gh-actions-oshwdem" -N ""
ssh-keyscan <server-host>          # -> DEPLOY_KNOWN_HOSTS secret
```

On the server, add the **public** key to `~/.ssh/authorized_keys` with a forced
command, so this credential can trigger a redeploy and nothing else:

```
command="/opt/oshwdem-live/deploy.sh",no-port-forwarding,no-agent-forwarding,no-pty,no-X11-forwarding ssh-ed25519 AAAA... gh-actions-oshwdem
```

Verify it is actually restricted — this must be refused, not give you a shell:

```bash
ssh -i ~/.ssh/oshwdem-deploy <user>@<server>
ssh -i ~/.ssh/oshwdem-deploy <user>@<server> 'cat /etc/passwd'
```

## Day-to-day

1. Push → `Build image` publishes `sha-abc1234` (shown in the run summary).
2. Actions → **Deploy** → `dev` + that tag → check `live-dev.oshwdem.org`.
3. Same tag → `prod`.

## Checks

```bash
docker compose ps
docker compose logs --tail=50 dev
curl -sI https://live-dev.oshwdem.org | head -1   # 401 = routing + auth work
curl -sI https://live.oshwdem.org     | head -1   # 200
```
