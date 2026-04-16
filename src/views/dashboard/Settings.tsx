import { useNavigate, useParams } from "@solidjs/router";
import { Component } from "solid-js";
import { API } from "../../shared/api";

const Settings: Component = () => {
    const navigate = useNavigate();
    const params = useParams();
    const guild_id = params.id!;

    const onUnlinkButtonClicked = async () => {
        try {
            const data = await API.deleteGuild(guild_id);
            console.log(data);
            
            navigate('/dashboard');
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