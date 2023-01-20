import { useParams } from "@solidjs/router";
import { Component } from "solid-js";
import GuildCache from "../../shared/cache";
import { callAPI } from "../../shared/utils";

const Settings: Component = () => {
    const params = useParams();
    const guild_id = params.id;
    const guild = GuildCache.getGuild(guild_id)!;

    const onUnlinkButtonClicked = async () => {
        try {
            const data = await callAPI(`/guilds/${params.id}/unsetup`, undefined, 'post');
            console.log(data);

            await guild.fetch(true);
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <>
            <button onClick={onUnlinkButtonClicked}>Unlink clan</button>
            <div style="height: 1000px;"></div>
        </>
    )
};

export default Settings;