import { Component, createSignal, For, onMount } from "solid-js";
import { callAPI } from "../shared/utils";
import { useNavigate } from '@solidjs/router';
import GuildList from "../components/GuildList";

import styles from './Dashboard.module.css';

const ADMINISTRATOR_FLAG = (1 << 3);

const Dashboard: Component = () => {
    const [guilds, setGuilds] = createSignal<any[]>([]);
    const navigate = useNavigate();

    onMount(async () => {
        try {
            const res = await callAPI('/guilds', {}, 'get');
            if(res.code === 200) {
                const items: any[] = [];
                for(const item of res.items) {
                    if((parseInt(item.permissions) & ADMINISTRATOR_FLAG) === ADMINISTRATOR_FLAG) {
                        items.push(item);
                    }
                }

                setGuilds(items);
            } else {
                console.error(`Error ${res.code}: ${res.msg}`);
            }
        } catch(error) {
            console.error(error);
        }
    })

    const onLogoutClicked = async () => {
        try {
            const res = await callAPI('/deauth', {}, 'post');
            if(res.code === 200) {
                console.log("Successfully deauthorizaed.");
                navigate('/');
            }
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <div class={styles.container}>
            <section class={styles.sidebar}>
                <div class={styles.sidebar_bottom}>
                    <GuildList list={guilds()}/>
                    <span class={`material-icons ${styles.logout}`} onClick={onLogoutClicked}>logout</span>
                </div>
            </section>
        </div>
    )
};

export default Dashboard;