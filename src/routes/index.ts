import axios from "axios";
import { Router } from "express";

const API_ENDPOINT = "https://discord.com/api/v10";

const MainRouter = Router();
MainRouter.get('/', async (req, res) => {
    res.render(`${__dirname}/../../views/index.ejs`, { page: 'empty' });
});

MainRouter.get('/guilds', (req, res) => {
    axios({
        url: `${API_ENDPOINT}/users/@me/guilds`,
        method: 'get',
        params: { limit: 100 },
        headers: {
            'Authorization': `Bot ${process.env.TOKEN}`
        }
    }).then(response => {
        const items: any[] = [];
        for(const guild of response.data) {
            items.push({ name: guild.name, id: guild.id, icon: guild.icon });
        }
        res.send(items);
    }).catch(error => res.send(error));
});

export default MainRouter;
