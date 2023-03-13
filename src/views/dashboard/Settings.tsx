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
            const data = await callAPI(`/guilds/${params.id}`, undefined, 'delete');
            console.log(data);

            await guild.fetch(true);
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <>
            <div class='top'>
                <h1>Settings</h1>
            </div>

            <button onClick={onUnlinkButtonClicked}>Unlink clan</button>
        </>
    )
};

export default Settings;