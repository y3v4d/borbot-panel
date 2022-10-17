import { Component } from "solid-js";
import styles from "./Home.module.css";

const LOGIN_URL='https://discord.com/api/oauth2/authorize?client_id=930275600697004082&redirect_uri=http%3A%2F%2F127.0.0.1%3A3010%2Fapi%2Fauth&response_type=code&scope=identify%20guilds';

const Home: Component = () => {
    const onLoginClicked = (event: Event) => {
        window.open(LOGIN_URL, 'popup', 'width=600,height=800');
        window.addEventListener('message', (event) => {
            if(event.origin != 'http://127.0.0.1:3010') {
                console.log(`Invalid origin: ${event.origin}`);
                return;
            }

            console.log(`Token is: ${event.data}`);
            console.log('Success!');
        });
    };

    return (
        <div class={styles.container}>
            <button onClick={onLoginClicked} class={styles.login_button}>Login with Discord</button> 
        </div>
    )
}

export default Home;