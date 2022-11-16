import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { callAPI, getCookie } from "../shared/utils";
import { A, Outlet, useNavigate, useParams } from '@solidjs/router';

import styles from './Dashboard.module.css';
import Dropdown from "../components/Dropdown";

const GuildCache = new Map<string, any>();

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
        console.log(`GUILDS`, data);
        const items: any[] = [];
        for(const item of data) {
            if(item.isAdmin) {
                items.push({ content: item.name, icon: item.icon, id: item.id });
            }
        }
        
        setGuilds(items);
    }).catch(error => {
        console.error(error);

        if(error.status == 401) {
            navigate('/');
        }
    });

    createEffect(async () => {
        if(params.id === undefined) return;

        const guild_id = params.id;
        if(GuildCache.has(guild_id)) {
            console.log(`[CACHE GUILD DATA]`, GuildCache.get(guild_id));
            setGuild(GuildCache.get(guild_id));
            return;
        }
        
        try {
            const data = await callAPI(`/guilds/${guild_id}`);
            console.log(`[NEW GUILD DATA]`, data);
            if(params.id === guild_id) setGuild(data);

            GuildCache.set(guild_id, data);
        } catch(error: any) {
            console.error(error);
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
                        <A end={true} activeClass={styles.navigation_link_active} href={`/dashboard/${params.id}/schedule`}>
                            <span class='material-icons'>calendar_month</span>
                            <p>Schedule</p>
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