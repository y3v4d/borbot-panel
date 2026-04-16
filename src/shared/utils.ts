import { Resource } from "solid-js";

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}

export function getAvatarUrl(user_id: string, avatar_id: string, size = 48) {
    return `https://cdn.discordapp.com/avatars/${user_id}/${avatar_id}.png?size=${size}`;
}

export function getGuildIconUrl(guild_id: string, icon_url?: string, size = 64) {
    return `https://cdn.discordapp.com/icons/${guild_id}/${icon_url}.png?size=${size}`;
}

export function getDefaultAvatarUrl(name: string, size = 48) {
    const params = {
        name: name,
        background: "494d54",
        uppercase: "false",
        color: "dbdcdd",
        "font-size": "0.33",
        size: size.toString()
    };

    return `https://ui-avatars.com/api?${new URLSearchParams(params).toString()}`;
}

export function diff<T extends Record<string, any>>(self: T, other: T): Partial<T> | null {
    const result: any = {};
    const keys = new Set([...Object.keys(self), ...Object.keys(other)]);
    let changed = false;

    for(const key of keys) {
        if(!(key in self)) {
            result[key] = other[key];
            changed = true;

            continue;
        }

        if(!(key in other)) {
            result[key] = undefined;
            changed = true;

            continue;
        }

        if(typeof self[key] === 'object' && typeof other[key] === 'object') {
            if(self[key] === null || other[key] === null) {
                if(self[key] !== other[key]) {
                    result[key] = other[key];
                    changed = true;
                }

                continue;
            }

            const child = diff(self[key], other[key]);
            if(child) {
                result[key] = child;
                changed = true;
            }

            continue;
        }

        if(self[key] !== other[key]) {
            result[key] = other[key];
            changed = true;
        }
    }

    return changed ? result : null;
}

export function extractResourceKey<T extends object, K extends keyof T>(
    resource: Resource<T> | null | undefined, 
    key: K
) : T[K] | undefined {
    if(!resource || resource.loading || resource.error) return undefined;

    const data = resource();
    if(!data) return undefined;

    if(key in data) {
        return data[key];
    }

    return undefined;
}

export function getClassName(id: number) {
    switch(id) {
        case 1: return "Rogue";
        case 2: return "Mage";
        case 3: return "Priest";
        default: return "Unknown";
    }
}