import { useParams } from "@solidjs/router";
import { Component } from "solid-js";
import { updateGuildData } from "../shared/cache";
import { callAPI } from "../shared/utils";

const Settings: Component = () => {
    const params = useParams();

    const onUnlinkButtonClicked = async () => {
        try {
            const data = await callAPI(`/guilds/${params.id}/unsetup`, undefined, 'post');
            console.log(data);
            
            updateGuildData(params.id);
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <button onClick={onUnlinkButtonClicked}>Unlink clan</button>
    )
};

export default Settings;