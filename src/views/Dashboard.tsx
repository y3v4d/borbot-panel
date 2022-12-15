import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { callAPI, getCookie } from "../shared/utils";
import { A, Outlet, useNavigate, useParams } from '@solidjs/router';

import styles from './Dashboard.module.css';
import Dropdown from "../components/Dropdown";
import SpinLoader from "../components/SpinLoader";
import Setup from "./Setup";
import { addGuildUpdateCallback, removeGuildUpdateCallbacks, updateGuildData } from "../shared/cache";

const Dashboard: Component = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [guilds, setGuilds] = createSignal<any[]>([]);
    const [guild, setGuild] = createSignal<any>(null);

    

    const onLogoutClicked = async () => {
        try {
            await callAPI('/auth/logout', {}, 'post');

            console.log("Successfully deauthorized.");
            navigate('/');
        } catch(error) {
            console.error(error);
        }
    }

    callAPI(`/me/guilds`).then(data => {
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
        if(guilds().length == 0 || params.id === undefined) return;

        const guild_id = params.id;
        
        removeGuildUpdateCallbacks();
        addGuildUpdateCallback(guild_id, (guild) => {
            console.log("Updating guild in Dashboard...");
            setGuild(guild);
        });

        try {
            await updateGuildData(guild_id);
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
                <Show when={guild() != null && guild().is_setup} fallback={<div class={styles.fill}></div>}>
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
                        <A end={true} activeClass={styles.navigation_link_active} href={`/dashboard/${params.id}/settings`}>
                            <span class='material-icons'>settings</span>
                            <p>Settings</p>
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
                <Show when={guild() != null} fallback={<SpinLoader></SpinLoader>}>
                    <Show 
                        when={guild().is_joined && guild().is_setup} 
                        fallback={<Setup guild={guild()}></Setup>
                    }>
                        <Outlet />
                    </Show>
                </Show>
            </div>
        </div>
    )
};

export default Dashboard;