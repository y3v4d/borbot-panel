import 'dotenv/config';

import axios from 'axios';
import express from 'express';
import mongoose, { ObjectId } from 'mongoose';
import GuildModel from './models/guild';
import MemberModel, { IMember } from './models/member';
import ScheduleModel from './models/schedule';
import DC from './api/discord';
import bodyParser from 'body-parser';

const API_ENDPOINT = "https://discord.com/api/v10";

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/../public"));

app.get('/', (req, res) => {
    axios({
        method: 'get',
        url: `${API_ENDPOINT}/users/@me/guilds`,
        params: { limit: 100 },
        headers: {
            'Authorization': `Bot ${process.env.TOKEN}`
        }
    }).then(response => {
        const items: { name: string, id: string }[] = [];
        for(const guild of response.data) {
            items.push({ name: guild.name, id: guild.id });
        }
        res.render(__dirname + "/../views/index.ejs", { items: items });
    }).catch(error => res.send(error));
});

app.post('/:id/schedule', async (req, res) => {
    const guild_id = req.params.id;

    const dbSchedule = await ScheduleModel.findOne({ guild_id: guild_id })
        .populate<{ map: [{ member: IMember, index: number }]}>("map.member");
    if(!dbSchedule) {
        res.send("Error retreiving schedule");
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
    res.redirect(`/${guild_id}/schedule`);
}); 

app.get('/:id/schedule', async (req, res) => {
    const guild_id = req.params.id;
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

    res.render(__dirname + "/../views/schedule.ejs", {
        start_day: dbSchedule.start_day,
        next_cycle: new Date(new Date(dbSchedule.start_day).getTime() + 10 * MS_IN_DAY),
        items: items,
        members: members,
        guild_id: guild_id
    });
});

app.get('/:id', async (req, res) => {
    res.send(req.params.id);
    /*const guild_id = req.params.id;
    const dbGuild = await GuildModel.findOne({ guild_id: guild_id });
    if(!dbGuild) {
        res.send("Error!");
        return;
    }

    const guildInfo = await CH.getGuildInfo(dbGuild.user_uid, dbGuild.password_hash);

    axios({
        method: 'get',
        url: `${API_ENDPOINT}/guilds/${guild_id}/members`,
        params: {
            limit: 100
        },
        headers: {
            'Authorization': `Bot ${process.env.TOKEN}`
        }
    }).then(async response => {
        const items: any[] = [];
        for(const member of response.data) {
            const dbMember = await MemberModel.findOne({ guild_uid: member.user.id });
            if(!dbMember) continue;

            let clanMember: CH.GuildInfoResultMember | null = null;
            for(const o of Object.values(guildInfo.guildMembers)) {
                if(o.uid == dbMember.clan_uid) {
                    clanMember = o;
                    break;
                }
            }
            if(!clanMember) continue;

            items.push({ 
                username: member.nick || member.user.username,
                avatar: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
                clan_username: clanMember.nickname
            });
        }
        res.render(__dirname + "/../views/members.ejs", { items: items });
    }).catch(error => res.send(error));*/
});

mongoose.connect(process.env.MONGODB_URI!).then(() => {
    console.log("Connected to MongoDB.");

    app.listen(3000, () => {
        console.log("Server started on port 3000.");
    });
}).catch(error => console.error(error));
