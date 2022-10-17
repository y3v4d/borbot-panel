import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { callAPI } from "../shared/utils";
import { A, Outlet, useNavigate, useParams } from '@solidjs/router';
import GuildList from "../components/GuildList";

import styles from './Dashboard.module.css';

const ADMINISTRATOR_FLAG = (1 << 3);

const Dashboard: Component = () => {
    const params = useParams();
    createEffect(() => {
        console.log(`I'm on ${params.id}`);
    })

    const [guilds, setGuilds] = createSignal<any[]>([]);
    const navigate = useNavigate();

    /*onMount(async () => {
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
                console.log('set items');
            } else {
                console.error(`Error ${res.code}: ${res.msg}`);
            }
        } catch(error) {
            console.error(error);
        }
    })*/

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
                <Show when={params.id} fallback={<div class={styles.fill}></div>}>
                    <nav class={styles.navigation}>
                        <A end={true} activeClass={styles.navigation_link_active} href={`/dashboard/${params.id}`}>
                            <span class='material-icons'>home</span>
                            <p>Overview</p>
                        </A>
                        <A end={true} activeClass={styles.navigation_link_active} href={`/dashboard/${params.id}/members`}>
                            <span class='material-icons'>people</span>
                            <p>Members</p>
                        </A>
                    </nav>
                </Show>
                <div class={styles.sidebar_bottom}>
                    <GuildList current={params.id}/>
                    <span class={`material-icons ${styles.logout}`} onClick={onLogoutClicked}>logout</span>
                </div>
            </section>
            <div>
                <Outlet/>
            </div>
        </div>
    )
};

export default Dashboard;