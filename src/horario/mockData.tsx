export const ActivityType = {
    Expo: "EXPO",
    Talk: "TALK",
    Stand: "STAND"
}

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export type Activity = {
    "id": number,
    "activity-name": String,
    "activity-type": ActivityType,
    "description": String,
    "picture": String,
    "zone": String,
    "table": String
}