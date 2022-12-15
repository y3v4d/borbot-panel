import { callAPI } from "./utils";

type GuildUpdateCallback = (guild: any) => void;

const GuildCache = new Map<string, any>();
const GuildCacheCallback = new Map<string, GuildUpdateCallback[]>();

export function addGuildUpdateCallback(id: string, callback: GuildUpdateCallback) {
    if(!GuildCacheCallback.has(id)) {
        GuildCacheCallback.set(id, []);
    }

    GuildCacheCallback.set(id, [callback, ...GuildCacheCallback.get(id)!]);
}

export function removeGuildUpdateCallbacks() {
    GuildCacheCallback.clear();
}

export async function updateGuildData(id: string) {
    const data = await callAPI(`/guilds/${id}`);
    GuildCache.set(id, data);

    console.log(`[NEW GUILD DATA]`, data);
    if(GuildCacheCallback.has(id)) {
        console.log("Invoking update callbacks...");
        for(const callback of GuildCacheCallback.get(id)!) {
            callback(data);
        }
    }
    
    return data;
}

export async function getGuildData(id: string) {
    let data: any = null;

    if(GuildCache.has(id)) {
        data = GuildCache.get(id);
        console.log(`[CACHE GUILD DATA]`, data);
    } else {
        try {
            data = await updateGuildData(id);
        } catch(error: any) {
            throw error;
        }
    }

    return data;
}