import { useNavigate, useParams } from "@solidjs/router";
import { Component } from "solid-js";
import styles from "./AddBot.module.css";

const ADD_URL = `https://discord.com/api/oauth2/authorize?client_id=930275600697004082&permissions=8&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Fauth%2Fback&response_type=code&scope=bot%20applications.commands%20identify`;

const AddBot: Component<{ callback?: () => void }> = (options) => {
    const params = useParams();

    const onAddClicked = async (event: Event) => {
        const url = ADD_URL + `&guild_id=${params.id}&disable_guild_select=true`;

        window.open(url, 'popup', 'width=600,height=800');
        window.onmessage = async (event) => {
            if(event.origin != 'http://127.0.0.1:3010') {
                console.log(`Invalid origin: ${event.origin}`);
                return;
            }

            try {
                if(options.callback) options.callback();
            } catch(error) {
                console.error(error);
            }
        };
    };

    return (
        <button class={styles.add_button} onClick={onAddClicked}>Add bot to server</button>
    );
};

export default AddBot;