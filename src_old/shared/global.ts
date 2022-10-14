import { params } from "./router";
import { callAPI } from "./utils";

let currentGuild: any = null;

export async function getCurrentGuildInfo() {
    if(currentGuild && currentGuild.id === params.id && currentGuild.clanMembers) return currentGuild;

    currentGuild = {};

    let data = await callAPI(`/guilds/${params.id}`);
    if(data.code != 200) {
        throw new Error(`Error: ${data.msg}`);
    }

    currentGuild.id = params.id;
    currentGuild.name = data.name;
    currentGuild.icon = data.icon.replace("size=64", "");
    currentGuild.is_setup = data.is_setup;

    if(currentGuild.is_setup) {
        data = await callAPI(`/guilds/${params.id}/guildMembers`);
        if(data.code != 200) {
            throw new Error(`Error: ${data.msg}`);
        }

        currentGuild.guildMembers = data.members;
    
        data = await callAPI(`/guilds/${params.id}/clanMembers`);
        if(data.code != 200) {
            throw new Error(`Error: ${data.msg}`);
        }

        currentGuild.clanMembers = data.members.sort((self, other) => {
            return self.nickname.toLocaleLowerCase().charCodeAt(0) - other.nickname.toLocaleLowerCase().charCodeAt(0);
        });
    }

    return currentGuild;
}