import { Router } from "express";

import DC from "../../api/discord";
import GuildModel from "../../models/guild";
import ScheduleModel from "../../models/schedule";
import MemberModel, { IMember } from "../../models/member";

const CDN_ENDPOINT = 'https://cdn.discordapp.com/icons';
const UI_ENDPOINT = 'https://ui-avatars.com/api';

function getGuildIconURL(guild: any, size = 64) {
    if(guild.icon) {
        return `${CDN_ENDPOINT}/${guild.id}/${guild.icon}.png?size=${size}`;
    } else {
        const params = {
            name: guild.name,
            background: "494d54",
            uppercase: "false",
            color: "dbdcdd",
            "font-size": "0.33",
            size: size.toString()
        };

        return `${UI_ENDPOINT}?${new URLSearchParams(params).toString()}`;
    }
}

const ScheduleRouter = Router({ mergeParams: true });

ScheduleRouter.get('/', async (req, res) => {
    const guild_id = (req.params as any).id;
    const db_guild = await GuildModel.findOne({ guild_id: guild_id });
    if(!db_guild) {
        res.send("Guild isn't setup...");
        return;
    }

    await MemberModel.find();

    const dbMembers = await MemberModel.find({ guild_id: guild_id });
    if(!dbMembers) {
        res.send("Error retreiving members!");
        return;
    }

    const dbSchedule = await ScheduleModel.findOne({ guild_id: guild_id })
        .populate<{ map: [{ member: IMember, index: number }]}>("map.member");
    if(!dbSchedule) {
        res.send("Error retrieving schedule!");
        return;
    }
    console.log("Fetched database!");

    const users: any[] = await DC.request(`guilds/${guild_id}/members?limit=100`);
    const members: any[] = [];
    for(const entry of dbMembers) {
        const guildUser = users.find(o => o.user.id === entry.guild_uid);
        if(!guildUser) {
            res.send("Error retreiving guild user!");
            return;
        }

        members.push({ name: guildUser.nick || guildUser.user.username, guild_uid: guildUser.user.id });
    }
    console.log("Pushed members!");

    const items: any[] = [];
    for(const entry of dbSchedule.map) {
        items.push({ selected_uid: entry.member.guild_uid, index: entry.index });
    }
    items.sort((self, other) => {
        return self.index - other.index;
    });

    const MS_IN_DAY = 86400000;
    console.log("Completed all!");

    const guild_info = await DC.request(`guilds/${guild_id}`);
    const guild = {
        id: guild_info.id,
        name: guild_info.name,
        icon: getGuildIconURL(guild_info)
    };

    res.render(__dirname + "/../../../views/index.ejs", {
        page: "schedule",
        show_categories: true,
        guild: guild,
        start_day: dbSchedule.start_day,
        next_cycle: new Date(new Date(dbSchedule.start_day).getTime() + 10 * MS_IN_DAY),
        items: items,
        members: members,
        guild_id: guild_id
    });
});

ScheduleRouter.post('/', async (req, res) => {
    const guild_id = (req.params as any).id;

    const dbSchedule = await ScheduleModel.findOne({ guild_id: guild_id })
        .populate<{ map: [{ member: IMember, index: number }]}>("map.member");
    if(!dbSchedule) {
        res.send({ code: -1, msg: "Couldn't retrieve schedule" });
        return;
    }

    for(let i = 0; i < dbSchedule.length; ++i) {
        const guild_uid = req.body[`${i + 1}`];
        if(!guild_uid) {
            console.warn("Didn't find index, skipping...");
            continue;
        }

        const entry = dbSchedule.map.find(o => o.index === i + 1);
        if(!entry) {
            console.warn(`Didn't find entry with index ${i + 1}`);
            continue;
        }

        if(entry.member.guild_uid === guild_uid) {
            console.log(`${i + 1} doesn't change, skipping...`);
            continue;
        }

        const dbMember = await MemberModel.findOne({ guild_uid: guild_uid });
        if(!dbMember) {
            res.send(`Couldn't retrieve member with guild uid: ${guild_uid} `);
            continue;
        }

        entry.member = dbMember;
        await dbSchedule.save();
    }

    await dbSchedule.save();
    res.redirect(`/guild/${guild_id}/schedule`);
}); 

export default ScheduleRouter;