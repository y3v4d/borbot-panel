import { Component, createEffect, createMemo, createResource, createSignal, Match, Show, Suspense, Switch } from "solid-js";
import { A, useNavigate, useParams } from '@solidjs/router';

import styles from './Dashboard.module.css';
import Dropdown from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";
import { JSX } from "solid-js/jsx-runtime";
import { getDefaultAvatarUrl, getGuildIconUrl } from "../../shared/utils";

const Dashboard: Component = (props: { children?: JSX.Element }) => {
    const navigate = useNavigate();
    const params = useParams();

    const guildId = createMemo(() => params.id ?? "");
    const [showSidebar, setShowSidebar] = createSignal(false);

    const [guilds] = createResource(async () => {
        const res = await API.getUserGuilds();
        console.log(`[USER GUILDS FETCHED]`, res);
        return res;
    });

    const [currentGuild] = createResource(guildId, async (id) => {
        if(!id) {
            return null;
        }

        const res = await API.getGuildInfo(id);
        console.log(`[GUILD INFO FETCHED FOR ${id}]`, res);

        return res;
    });

    const onLogoutClicked = async () => {
        try {
            await API.logout();

            console.log("Successfully deauthorized.");
            navigate('/');
        } catch(error) {
            console.error(error);
        }
    }

    createEffect(() => {
        if(currentGuild.loading) return;

        const guild = currentGuild();
        if(!guild) {
            console.warn(`Guild with id ${guildId()} not found`);
            return;
        }

        if(!guild.is_joined || !guild.is_setup) {
            navigate(`/dashboard/${guild.id}/setup`);
        } else {
            navigate(`/dashboard/${guild.id}`);
        }
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
                <section class={styles.sidebar} classList={{ [styles.show]: showSidebar() }}>
                    <Show when={!currentGuild.loading && !currentGuild.error && currentGuild()?.is_setup && currentGuild()?.is_joined} fallback={<div class={styles.fill}></div>}>
                        <nav class={styles.navigation}>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                inactiveClass={styles.navigation_link_inactive}
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}`}
                            >
                                <span class='material-icons'>home</span>
                                <p>Overview</p>
                            </A>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                inactiveClass={styles.navigation_link_inactive}
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}/members`}
                            >
                                <span class='material-icons'>people</span>
                                <p>Members</p>
                            </A>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                inactiveClass={styles.navigation_link_inactive}
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}/raid`}
                            >
                                <span class='material-icons'>shield</span>
                                <p>Raid</p>
                            </A>
                            <A 
                                onClick={() => setShowSidebar(false)} 
                                end={true} 
                                inactiveClass={styles.navigation_link_inactive}
                                activeClass={styles.navigation_link_active} 
                                href={`/dashboard/${params.id}/settings`}
                            >
                                <span class='material-icons'>settings</span>
                                <p>Settings</p>
                            </A>
                        </nav>
                    </Show>
                    <div class={styles.sidebar_bottom}>
                        <Suspense fallback={<SpinLoader></SpinLoader>}>
                            <Switch>
                                <Match when={guilds.error}>
                                    <p>Error loading guilds</p>
                                </Match>
                                <Match when={guilds()}>
                                    <Dropdown 
                                        items={guilds()!.map(guild => ({ 
                                            id: guild.id, 
                                            content: guild.name, 
                                            icon: guild.icon ? getGuildIconUrl(guild.id, guild.icon) : getDefaultAvatarUrl(guild.name)
                                        }))} 
                                        up={true} 
                                        selected={guildId()}
                                        callback={(id: string) => {
                                            navigate(`/dashboard/${id}`)
                                        }}
                                        nullable={false}
                                        hide_border={true}
                                    />
                                </Match>
                            </Switch>
                        </Suspense>
                        
                        <span class={`material-icons ${styles.logout}`} onClick={onLogoutClicked}>logout</span>
                    </div>
                </section>
                <div class={styles.dashboard_container}>
                    <Show when={!currentGuild.loading && !currentGuild.error} fallback={<SpinLoader></SpinLoader>}>
                        <Switch>
                            <Match when={currentGuild.error}>
                                <div class={styles.fill}>
                                    <p>Error loading guild info</p>
                                </div>
                            </Match>
                            <Match when={currentGuild()}>
                                {props.children}
                            </Match>
                        </Switch>
                    </Show>
                </div>
            </div>
        </>
    )
};

export default Dashboard;