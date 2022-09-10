import { Router } from "express";

import DC from "../../api/discord";
import Clan from "../../shared/clan";
import GuildModel, { IGuild } from "../../models/guild";

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

const GuildRouter = Router({ mergeParams: true });

GuildRouter.get('/:id', async (req, res) => {
    const guild_id = (req.params as any).id;
    const guild_info = await DC.request(`guilds/${guild_id}`);
    if(guild_info.code != undefined) {
        res.send("Didn't find guild!");
        return;
    }

    const db_guild = await GuildModel.findOne({ guild_id: guild_id });
    const flag = req.session.flag;
    req.session.flag = 0;

    const guild: any = {
        id: guild_info.id,
        name: guild_info.name,
        icon: getGuildIconURL(guild_info)
    };

    res.render(`${__dirname}/../../../views/index.ejs`, {
        page: 'guild',
        show_categories: true,
        guild: guild,
        guild_id: guild_id,
        is_setup: db_guild != null,
        login_error: flag 
    });
});

GuildRouter.post('/:id/setup', async (req, res) => {
    const guild_id = req.params.id;
    const db_guild = await GuildModel.findOne({ guild_id: guild_id });
    if(db_guild) {
        console.warn("Guild already setup!");
        res.redirect(`/guild/${guild_id}`);
        return;
    }

    const uid = req.body.uid;
    const password_hash = req.body.pwd;
    
    const isValid = await Clan.validate(uid, password_hash);
    if(!isValid) {
        req.session.flag = 1;
        res.redirect(`/guild/${guild_id}`);
        return;
    }

    const schema: IGuild = {
        guild_id: guild_id,
        user_uid: uid,
        password_hash: password_hash
    };

    await (new GuildModel(schema)).save();
    res.redirect(`/guild/${guild_id}`);
});

GuildRouter.post('/:id/unsetup', async (req, res) => {
    const guild_id = req.params.id;
    const db_guild = await GuildModel.findOne({ guild_id: guild_id });
    if(!db_guild) {
        console.warn("Guild already unsetup!");
        res.redirect(`/guild/${guild_id}`);
        return;
    }

    await db_guild.delete();
    res.redirect(`/guild/${guild_id}`);
});

export default GuildRouter;