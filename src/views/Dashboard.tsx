import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { callAPI } from "../shared/utils";
import { A, Outlet, useNavigate, useParams } from '@solidjs/router';
import GuildList from "../components/GuildList";

import styles from './Dashboard.module.css';

const ADMINISTRATOR_FLAG = (1 << 3);

const Dashboard: Component = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [guild, setGuild] = createSignal<any>({});

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

    createEffect(async () => {
        setGuild({});
        
        const res = await callAPI(`/guilds/${params.id}`);
        console.log(res);

        if(res.code == 200) {
            setGuild(res.data);
        } else if(res.code == 401) {
            navigate('/');
        }
    });

    return (
        <div class={styles.container}>
            <section class={styles.sidebar}>
                <Show when={guild().is_setup} fallback={<div class={styles.fill}></div>}>
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
            <div class={styles.dashboard_container}>
                <Show when={guild().is_joined} fallback={<div>Not joined</div>}>
                    <Outlet />
                </Show>
            </div>
        </div>
    )
};

export default Dashboard;