import { getCookie } from "./utils";

export namespace API {
    async function request<T>(method: "get" | "post", path: string, params?: any) {
        const ENDPOINT = 'http://localhost:3010/api';

        try {
            const res = await fetch(`${ENDPOINT}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getCookie('token')
                },
                body: method == 'post' ? JSON.stringify(params) : undefined,
                credentials: 'include'
            });

            const json = await res.json();
            if(!res.ok) {
                throw { status: res.status, data: json }
            }

            return json as T;
        } catch(error) {
            throw error;
        }
    }

    export type UserInfo = {
        id: string,
        username: string,
        avatar: string,
        discriminator: string
    }

    export type UserGuild = {
        name: string,
        id: string, 
        icon: string, 
        permissions: string,
        isAdmin: boolean
    }

    export type GuildInfo = {
        id: string,
        name: string,
        icon: string,
        permissions: string,
        isAdmin: boolean,
        is_setup: boolean,
        is_joined: boolean
    }

    export type GuildMember = {
        id: string,
        disc: string,
        username: string,
        avatar: string,
        nickname: string,
        isBot: boolean
    }

    export type ClanMember = {
        uid: string,
        highestZone: number,
        nickname: string,
        class: number,
        level: number,

        lastRewardTimestamp: string,
        lastBonusRewardTimestamp: string
    }

    export type GuildMembers = {
        clan: ClanMember[],
        guild: GuildMember[]
    }

    export type GuildConnected = {
        guild_uid: string,
        clan_uid: string
    }

    export type GuildScheduleEntry = {
        uid: string,
        index: number
    }

    export type GuildSchedule = {
        id: string,
        start: string,
        next_cycle: string,
        entries: GuildScheduleEntry[]
    }

    export async function getUserInfo() {
        return await request<UserInfo>('get', 'me');
    }

    export async function getUserGuilds() {
        return await request<UserGuild[]>('get', 'me/guilds');
    }

    export async function getGuildInfo(id: string) {
        return await request<GuildInfo>('get', `guilds/${id}`);
    }

    export async function getGuildMembers(id: string) {
        return await request<GuildMembers>('get', `guilds/${id}/members`);
    }

    export async function getGuildConnected(id: string) {
        return await request<GuildConnected[]>('get', `guilds/${id}/connected`);
    }

    export async function postGuildConnected(id: string, connected: GuildConnected[]) {
        return await request<any>('post', `guilds/${id}/connected`, { data: connected });
    }

    export async function getGuildSchedule(id: string) {
        return await request<GuildSchedule>('get', `guilds/${id}/schedule`);
    }

    export async function postGuildSchedule(id: string, entries: GuildScheduleEntry[]) {
        return await request<any>('post', `guilds/${id}/schedule`, { data: entries });
    }
}