import { useParams } from "@solidjs/router";
import { Component, createSignal, For } from "solid-js";
import Dropdown from "../components/Dropdown";
import { callAPI } from "../shared/utils";

import styles from './Members.module.css';

const ConnectedCache = new Map<string, any>();
const Members: Component = () => {
    const [clanMembers, setClanMembers] = createSignal<any[]>([]);
    const [members, setMembers] = createSignal<any[]>([]);
    const [connected, setConnected] = createSignal<any[]>([]);

    const params = useParams();
    const guild_id = params.id;

    const onSubmitButtonClicked = async () => {
        const result = await callAPI(`/guilds/${guild_id}/connected`, { data: connected() }, 'post');
        console.log(result);
    };

    callAPI(`/guilds/${guild_id}/connected`)
    .then(data => {
        console.log(`[NEW CONNECTED LIST]`, data);

        setConnected(data);
        ConnectedCache.set(guild_id, data);

        callAPI(`/guilds/${guild_id}/members`)
        .then(data => {
            console.log(data);

            const guildMembers = data.guild.map((o: any) => {
                return {
                    id: o.id,
                    icon: o.avatar,
                    content: o.username,
                }
            });

            setClanMembers(data.clan);
            setMembers(guildMembers);
        }).catch(error => console.error(error))
    }).catch(error => console.error(error))
    
    return (
        <>
            <div class={styles.top}>
                <h1>Members</h1>
                <button class={styles.save_btn} onClick={onSubmitButtonClicked}>
                    <span class='material-icons'>done</span>
                </button>
            </div>
            <div class={styles.container}>
                <For each={clanMembers()}>
                    {
                        (member: any) => (
                            <div id={member.uid} class={styles.item}>
                                <p>{member.nickname}</p>
                                <Dropdown 
                                    items={members()} 
                                    selected={connected().find(o => o.clan_uid === member.uid)?.guild_uid}
                                    callback={(id: string) => {
                                        const current = connected();
                                        const option = current.find(o => o.clan_uid === member.uid);
                                        option.guild_uid = id;

                                        setConnected(current);
                                    }}
                                />
                            </div>
                        )
                    }
                </For>
                    
            </div>
        </>
    );
};

export default Members;