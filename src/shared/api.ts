import { getCookie } from "./utils";

export namespace API {
    async function request<T>(method: "GET" | "POST" | "PATCH", path: string, params?: any) {
        const ENDPOINT = 'http://localhost:3010/api';

        try {
            const res = await fetch(`${ENDPOINT}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getCookie('token')
                },
                body: method == 'POST' || method === 'PATCH' ? JSON.stringify(params) : undefined,
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
        is_joined: boolean,

        raid_announcement_channel?: string,
        raid_fight_role?: string,
        raid_claim_role?: string,

        remind_channel?: string
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

    export type GuildChannel = {
        id: string,
        name: string
    }

    export type GuildRole = {
        id: string,
        name: string
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
        cycle_start: string,
        entries: GuildScheduleEntry[],
        channel: string
    }

    export type GuildPatchParams = {
        raid_announcement_channel?: string,
        raid_fight_role?: string,
        raid_claim_role?: string,
        remind_channel?: string
    }

    export async function getUserInfo() {
        return await request<UserInfo>('GET', 'me');
    }

    export async function getUserGuilds() {
        return await request<UserGuild[]>('GET', 'me/guilds');
    }

    export async function getGuildInfo(id: string) {
        return await request<GuildInfo>('GET', `guilds/${id}`);
    }

    export async function patchGuild(id: string, params: GuildPatchParams) {
        return await request<any>('PATCH', `guilds/${id}`, params);
    }

    export async function getGuildClanMembers(id: string) {
        return await request<ClanMember[]>('GET', `guilds/${id}/clan/members`);
    }

    export async function getGuildMembers(id: string) {
        return await request<GuildMember[]>('GET', `guilds/${id}/members`);
    }

    export async function getGuildChannels(id: string) {
        return await request<GuildChannel[]>('GET', `guilds/${id}/channels`);
    }

    export async function getGuildRoles(id: string) {
        return await request<GuildRole[]>('GET', `guilds/${id}/roles`);
    }

    export async function getGuildConnected(id: string) {
        return await request<GuildConnected[]>('GET', `guilds/${id}/connected`);
    }

    export async function postGuildConnected(id: string, connected: GuildConnected[]) {
        return await request<any>('POST', `guilds/${id}/connected`, { data: connected });
    }

    export async function getGuildSchedule(id: string) {
        return await request<GuildSchedule>('GET', `guilds/${id}/schedule`);
    }

    export async function postGuildSchedule(id: string, entries: GuildScheduleEntry[], schedule_channel?: string, cycle_start?: Date) {
        const params = {
            list: entries,
            schedule_channel: schedule_channel || "",
            cycle_start: cycle_start
        };

        return await request<any>('POST', `guilds/${id}/schedule`, params);
    }
}