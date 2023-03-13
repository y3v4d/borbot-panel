import { API } from "./api";

export type GuildUpdateCallback = (guild: Guild) => void;

export class ClanMember {
    public uid: string = "";
    public highestZone: number = 0;
    public nickname: string = "";
    public class: number = 0;
    public level: number = 0;

    public lastRewardTimestamp: string = "";
    public lastBonusRewardTimestamp: string = "";

    constructor(data: API.ClanMember) {
        this.uid = data.uid;
        this.highestZone = data.highestZone;
        this.nickname = data.nickname;
        this.class = data.class;
        this.level = data.level;

        this.lastRewardTimestamp = data.lastRewardTimestamp;
        this.lastBonusRewardTimestamp = data.lastBonusRewardTimestamp;
    }

    getClassName() {
        switch(this.class) {
            case 1: return "Rogue";
            case 2: return "Mage";
            case 3: return "Priest";
            default: return "Unknown";
        }
    }
}

export class GuildMember {
    public id: string;
    public disc: string;
    public username: string;
    public avatar: string;
    public nickname: string;
    public isBot: boolean;

    constructor(data: API.GuildMember) {
        this.id = data.id;
        this.disc = data.disc;
        this.username = data.username;
        this.avatar = data.avatar;
        this.nickname = data.nickname;
        this.isBot = data.isBot;
    }
}

export class Guild {
    public id: string;
    public name: string;
    public icon: string;
    public permissions: string;
    public isAdmin: boolean;

    public is_setup: boolean = false;
    public is_joined: boolean = false;

    public raid_announcement_channel = "";
    public raid_fight_role = "";
    public raid_claim_role = "";

    public remind_channel = "";

    public milestone_channel = "";
    public chat_channel = "";

    public members: GuildMember[];
    public clanMembers: ClanMember[];

    private watchCallback: GuildUpdateCallback | null = null;
    public extended: boolean = false;

    constructor(data: API.UserGuild) {
        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon;
        this.permissions = data.permissions;
        this.isAdmin = data.isAdmin;

        this.members = [];
        this.clanMembers = [];
    }

    watch(callback: GuildUpdateCallback | null) {
        this.watchCallback = callback;
    }

    async fetch(force = false) {
        if(!force && this.extended) {
            return;
        }

        const data = await API.getGuildInfo(this.id);

        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon;
        this.permissions = data.permissions;
        this.isAdmin = data.isAdmin;

        this.is_setup = data.is_setup;
        this.is_joined = data.is_joined;

        this.raid_announcement_channel = data.raid_announcement_channel || "";
        this.raid_fight_role = data.raid_fight_role || "";
        this.raid_claim_role = data.raid_claim_role || "";

        this.remind_channel = data.remind_channel || "";
        this.milestone_channel = data.milestone_channel || "";
        this.chat_channel = data.chat_channel || "";

        this.extended = true;

        console.log(`[GUILD ${this.id} FETCHED]`, this);

        if(this.watchCallback) {
            this.watchCallback(this);
        }
    }

    async fetchMembers(force = false) {
        if(!force && this.members.length > 0 && this.clanMembers.length > 0) {
            return;
        }

        const timer = Date.now();

        try {
            const guildMembers = await API.getGuildMembers(this.id);
            const clanMembers = await API.getGuildClanMembers(this.id);

            this.members = [];
            this.clanMembers = [];

            for(const member of guildMembers) {
                this.members.push(new GuildMember(member));
            }

            for(const member of clanMembers) {
                this.clanMembers.push(new ClanMember(member));
            }

            console.log(`[MEMBERS FETCHED FOR ${this.id}]`, this.members, this.clanMembers);
        } catch(error) {
            throw error;
        }

        console.log(`Fetch members completed in ${Date.now() - timer}ms`);
    }
}

export class GuildManager {
    public guilds: Guild[] = [];
    public callbacks: Map<string, GuildUpdateCallback> = new Map();
    
    async fetch() {
        this.guilds = [];

        try {
            const guilds = await API.getUserGuilds();

            for(const guild of guilds) {
                this.guilds.push(new Guild(guild));
            }

            console.log(`[ALL GUILDS LIGHT FETCHED]`, this.guilds);
        } catch(error) {
            throw error;
        }
    }

    getGuild(guild_id: string) {
        return this.guilds.find(o => o.id === guild_id);
    }
}

const GuildCache = new GuildManager();
export default GuildCache;