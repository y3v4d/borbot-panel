import { Component, createEffect, createSignal, Show } from "solid-js";
import { callAPI } from "../../shared/utils";
import { A, Outlet, useNavigate, useParams } from '@solidjs/router';

import styles from './Dashboard.module.css';
import Dropdown from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import Setup from "./Setup";
import GuildCache, { Guild } from "../../shared/cache";

const Dashboard: Component = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [guilds, setGuilds] = createSignal<any[]>([]);
    const [guild, setGuild] = createSignal<Guild | null>(null, { equals: false });
    const [showSidebar, setShowSidebar] = createSignal(false);

    let sidebar: HTMLElement | undefined;

    const onLogoutClicked = async () => {
        try {
            await callAPI('/auth/logout', {}, 'post');

            console.log("Successfully deauthorized.");
            navigate('/');
        } catch(error) {
            console.error(error);
        }
    }

    GuildCache.fetch().then(() => {
        const items: any[] = [];
        for(const guild of GuildCache.guilds) {
            if(guild.isAdmin) {
                items.push({ content: guild.name, icon: guild.icon, id: guild.id });
            }
        }

        setGuilds(items);
    }).catch((error: any) => {
        console.error(error);

        if(error.status === 401) {
            navigate('/');
        }
    });

    createEffect(async () => {
        if(guilds().length == 0 || params.id === undefined) return;

        const cache = GuildCache.getGuild(params.id);
        if(!cache || !cache.isAdmin) {
            navigate('/');
            return;
        }

        await cache.fetch();
        console.log('Setting guild', cache);
        setGuild(cache);
        
        cache.watch(g => {
            if(g.id !== params.id) return;

            setGuild(g);
        });
    });

    return (
        <>
            <header class="title">
                <button class={styles.menu_button} onClick={() => { setShowSidebar(!showSidebar()); }}>
                    <span class="material-icons" classList={{ "md-bold": showSidebar() }}>menu</span>
                </button>
                <img src="/src/assets/favicon.ico"></img>
                <h2>BORBOT</h2>
            </header>
            <div class={styles.container}>
                <section ref={sidebar!} class={styles.sidebar} classList={{ [styles.show]: showSidebar() }}>
                    <Show when={guild()?.is_setup} fallback={<div class={styles.fill}></div>}>
                        <nav class={styles.navigation}>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}`}
                            >
                                <span class='material-icons'>home</span>
                                <p>Overview</p>
                            </A>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}/members`}
                            >
                                <span class='material-icons'>people</span>
                                <p>Members</p>
                            </A>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}/schedule`}
                            >
                                <span class='material-icons'>calendar_month</span>
                                <p>Schedule</p>
                            </A>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}/settings`}
                            >
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
                    <Show when={guild()?.extended} fallback={<SpinLoader></SpinLoader>}>
                        <Show 
                            when={guild()?.is_joined && guild()?.is_setup} 
                            fallback={<Setup guild={guild()}></Setup>
                        }>
                            <Outlet />
                        </Show>
                    </Show>
                </div>
            </div>
        </>
    )
};

export default Dashboard;