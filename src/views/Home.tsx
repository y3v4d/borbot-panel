import { Component, createResource, Show } from "solid-js";
import { callAPI } from "../shared/utils";
import styles from "./Home.module.css";
import { useNavigate } from '@solidjs/router';

const LOGIN_URL='https://discord.com/api/oauth2/authorize?client_id=930275600697004082&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Fauth&response_type=code&scope=identify%20guilds';

const fetchUser = async () => {
    return await callAPI('/me', null, 'get');
}

const Home: Component = () => {
    const navigate = useNavigate();
    const [user] = createResource(fetchUser);

    const onLoginClicked = async (event: Event) => {
        window.open(LOGIN_URL, 'popup', 'width=600,height=800');
        window.onmessage = async (event) => {
            if(event.origin != 'http://127.0.0.1:3010') {
                console.log(`Invalid origin: ${event.origin}`);
                return;
            }

            console.log(`Token is: ${event.data}`);
            try {
                const data = await callAPI('/auth', { code: event.data }, 'post');
                if(data.code !== 200) {
                    console.error(`Encountered error: ${data.msg}`);
                    return;
                }

                console.log('Success!');
                navigate('/dashboard');
            } catch(error) {
                console.error(error);
            }
        };
    };

    const onDashboardClicked = async (event: Event) => {
        console.log("Moving to dashboard");

        navigate('/dashboard');
    }

    return (
        <div class={styles.container}>
            <Show
                when={!user.loading && user().code == 200}
                fallback={<button onClick={onLoginClicked} class={styles.login_button}>Login with Discord</button>}
            >
                <button class={styles.login_button} onClick={onDashboardClicked}>Dashboard</button>
            </Show>
        </div>
    )
}

export default Home;