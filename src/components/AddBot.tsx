import { useParams } from "@solidjs/router";
import { Component } from "solid-js";
import styles from "./AddBot.module.css";

const ADD_URL = import.meta.env.VITE_DISCORD_BOT_AUTH;

const AddBot: Component<{ callback?: () => void }> = (props) => {
    const params = useParams();

    const onAddClicked = async (event: Event) => {
        const url = ADD_URL + `&guild_id=${params.id}&disable_guild_select=true`;
        
        window.open(url);
        props.callback?.();
    };

    return (
        <button class={styles.add_button} onClick={onAddClicked}>Add bot to server</button>
    );
};

export default AddBot;