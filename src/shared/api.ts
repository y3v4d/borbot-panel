export namespace API {
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

    export interface GuildDiscordRole {
        id: string,
        name: string,
        color?: string,
        valid: boolean,

        last_update: Date
    }

    export interface GuildDiscordChannel {
        id: string,
        name: string,
        valid: boolean,

        last_update: Date
    }

    export enum RaidStatus {
        NONE = 0,
        FIRST_AVAILABLE = 1,
        BONUS_AVAILABLE = 2,
        COMPLETED = 3
    }

    export type GuildRaidInfo = {
        channel: GuildDiscordChannel,
        fight_role?: GuildDiscordRole,
        claim_role?: GuildDiscordRole,

        status: RaidStatus,
        last_update?: Date
    }

    export type GuildRemindInfo = {
        channel: GuildDiscordChannel,
        last_remind?: Date
    }

    export type GuildChatInfo = {
        channel: GuildDiscordChannel,
        last_update?: Date
    }

    export type GuildMilestoneInfo = {
        channel: GuildDiscordChannel,
    }

    export type GuildScheduleInfo = {
        channel?: GuildDiscordChannel,
        message_id?: string,

        cycle_start: Date,
        list: (string | null)[],

        last_update?: Date
    }

    export type GuildInfo = {
        id: string,

        user_uid: string,
        password_hash: string,
        clan_name: string,
        
        raid?: GuildRaidInfo,
        remind?: GuildRemindInfo,
        chat?: GuildChatInfo,
        milestone?: GuildMilestoneInfo,

        schedule?: GuildScheduleInfo,

        is_setup: boolean,
        is_joined: boolean
    }

    export type GuildDiscordMember = {
        user_id: string,
        username: string,
        avatar: string,
    }

    export type GuildMember = {
        guild_id: string,
        clan_uid: string,

        nickname: string,
        highest_zone: number,

        level: number,
        role: number,

        highest_milestone: number,

        discord?: {
            user_id: string,
            username: string,
            avatar: string,
            cached_at: Date,
        }
    }

    export type GuildSchedule = {
        cycle_start: string,
        entries: (string | null)[]
        channel: string
    }

    export async function login(code: string) {
        return await request<any>('POST', 'auth/login', { code });
    }

    export async function logout() {
        return await request<any>('POST', 'auth/logout');
    }

    export async function getUserInfo() {
        return await request<UserInfo>('GET', 'user');
    }

    export async function getUserGuilds() {
        return await request<UserGuild[]>('GET', 'user/guilds');
    }

    export async function getGuildInfo(id: string) {
        return await request<GuildInfo>('GET', `guilds/${id}`);
    }

    export async function setupGuild(id: string, uid: string, password_hash: string) {
        return await request<any>('POST', `guilds/${id}`, { uid, pwd: password_hash });
    }

    export async function deleteGuild(id: string) {
        return await request<any>('DELETE', `guilds/${id}`);
    }

    export async function setGuildRaid(id: string, raidInfo: { channel?: string, fight_role?: string, claim_role?: string }) {
        return await request<any>('PATCH', `guilds/${id}/raid`, raidInfo);
    }

    export async function unsetGuildRaid(id: string) {
        return await request<any>('DELETE', `guilds/${id}/raid`);
    }

    export async function setGuildRemind(id: string, remindInfo: { channel?: string }) {
        return await request<any>('PATCH', `guilds/${id}/remind`, remindInfo);
    }

    export async function unsetGuildRemind(id: string) {
        return await request<any>('DELETE', `guilds/${id}/remind`);
    }

    export async function setGuildChat(id: string, chatInfo: { channel?: string }) {
        return await request<any>('PATCH', `guilds/${id}/chat`, chatInfo);
    }

    export async function unsetGuildChat(id: string) {
        return await request<any>('DELETE', `guilds/${id}/chat`);
    }

    export async function setGuildMilestone(id: string, milestoneInfo: { channel?: string }) {
        return await request<any>('PATCH', `guilds/${id}/milestone`, milestoneInfo);
    }

    export async function unsetGuildMilestone(id: string) {
        return await request<any>('DELETE', `guilds/${id}/milestone`);
    }

    export async function setGuildSchedule(id: string, scheduleInfo: { channel?: string, cycle_start?: Date, list?: (string | null)[] }) {
        return await request<any>('PATCH', `guilds/${id}/schedule`, scheduleInfo);
    }

    export async function unsetGuildSchedule(id: string) {
        return await request<any>('DELETE', `guilds/${id}/schedule`);
    }

    export async function getGuildMembers(id: string) {
        return await request<GuildMember[]>('GET', `guilds/${id}/members`);
    }

    export async function listGuildDiscordMembers(id: string, after?: string) {
        return await request<GuildDiscordMember[]>('GET', `guilds/${id}/discord/members${after ? `?after=${after}` : ''}`);
    }

    export async function updateGuildMembers(id: string, update: { clan_uid: string, data: { guild_uid?: string | null } }[]) {
        return await request<any>("PATCH", `guilds/${id}/members`, { update });
    }

    export async function patchGuildMemberLink(guild_id: string, clan_uid: string, discord_user_id: string | null) {
        return await request<any>("PATCH", `guilds/${guild_id}/member-link`, { clan_uid, discord_user_id });
    }

    export async function getGuildDiscordChannels(id: string) {
        return await request<GuildDiscordChannel[]>('GET', `guilds/${id}/discord/channels`);
    }

    export async function getGuildDiscordRoles(id: string) {
        return await request<GuildDiscordRole[]>('GET', `guilds/${id}/discord/roles`);
    }

    async function request<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, params?: any) {
        const ENDPOINT = `${import.meta.env.VITE_API_ADDRESS}/api`;

        try {
            const res = await fetch(`${ENDPOINT}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
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
}