import 'dotenv/config';

import axios from 'axios';
import express from 'express';
import mongoose from 'mongoose';
import GuildModel from './models/guild';
import CH from './api/clickerheroes';
import MemberModel from './models/member';

const API_ENDPOINT = "https://discord.com/api/v10";

const app = express();
app.set('view engine', 'ejs');

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

app.get('/:id', async (req, res) => {
    const guild_id = req.params.id;
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
    }).catch(error => res.send(error));
});

mongoose.connect(process.env.MONGODB_URI!).then(() => {
    console.log("Connected to MongoDB.");

    app.listen(3000, () => {
        console.log("Server started on port 3000.");
    });
});
