import 'dotenv/config';

import axios from 'axios';
import express from 'express';
import mongoose from 'mongoose';

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

app.get('/:id', (req, res) => {
    const guild_id = req.params.id;
    axios({
        method: 'get',
        url: `${API_ENDPOINT}/guilds/${guild_id}/members`,
        params: {
            limit: 100
        },
        headers: {
            'Authorization': `Bot ${process.env.TOKEN}`
        }
    }).then(response => {
        const items: { username: string, avatar: string }[] = [];
        for(const member of response.data) {
            
            items.push({ 
                username: member.nick || member.user.username,
                avatar: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
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
