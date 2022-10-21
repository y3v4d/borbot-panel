import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { callAPI } from "../shared/utils";
import { A, Outlet, useNavigate, useParams } from '@solidjs/router';

import styles from './Dashboard.module.css';
import Dropdown from "../components/Dropdown";

const ADMINISTRATOR_FLAG = (1 << 3);

const Dashboard: Component = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [guilds, setGuilds] = createSignal<any[]>([]);
    const [guild, setGuild] = createSignal<any>({});

    const onLogoutClicked = async () => {
        try {
            await callAPI('/auth/logout', {}, 'post');

            console.log("Successfully deauthorized.");
            navigate('/');
        } catch(error) {
            console.error(error);
        }
    }

    callAPI(`/me/guilds`)
    .then(data => {
        const items: any[] = [];
        for(const item of data) {
            if((parseInt(item.permissions) & ADMINISTRATOR_FLAG) === ADMINISTRATOR_FLAG) {
                items.push({ content: item.name, icon: item.icon, id: item.id });
            }
        }

        setGuilds(items);
    }).catch(error => console.error(error));

    createEffect(async () => {
        if(params.id === undefined) return;
        
        setGuild({});
        
        try {
            const data = await callAPI(`/guilds/${params.id}`);
            setGuild(data);
        } catch(error: any) {
            if(error.status == 401) { // Unauthorized
                navigate('/');
            }
            
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
                    <Dropdown 
                        items={guilds()} 
                        up={true} 
                        selected={params.id}
                        callback={(id: string) => navigate(`/dashboard/${id}`)}
                    />
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