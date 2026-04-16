import { Component, createResource, Show } from "solid-js";
import styles from "./Home.module.css";
import { useNavigate } from '@solidjs/router';
import { API } from "../../shared/api";

const LOGIN_URL=import.meta.env.VITE_DISCORD_AUTH as string;

const fetchUser = async () => {
    try {
        const user = await API.getUserInfo();
        return user;
    } catch(error) {
        return null;
    }
}

const Home: Component = () => {
    const navigate = useNavigate();
    const [user] = createResource(fetchUser);

    const onLoginClicked = async (event: Event) => {
        window.open(LOGIN_URL, 'popup', 'width=600,height=800');
        window.onmessage = async (event) => {
            if(event.origin != import.meta.env.VITE_ORIGIN) {
                console.log(`Invalid origin: ${event.origin}`);
                return;
            }

            try {
                await API.login(event.data);
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
                when={ !user.loading && !user }
                fallback={<button onClick={onLoginClicked} class={styles.login_button}>Login with Discord</button>}
            >
                <button class={styles.login_button} onClick={onDashboardClicked}>Dashboard</button>
            </Show>
        </div>
    )
}

export default Home;