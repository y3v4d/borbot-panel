import { useParams } from "@solidjs/router";
import { Component, createSignal, For } from "solid-js";
import Dropdown from "../components/Dropdown";
import { callAPI } from "../shared/utils";

import styles from './Members.module.css';

const Members: Component = () => {
    const [clanMembers, setClanMembers] = createSignal<any[]>([]);
    const [members, setMembers] = createSignal<any[]>([]);
    const [connected, setConnected] = createSignal<any[]>([]);

    const params = useParams();
    const guild_id = params.id;

    callAPI(`/guilds/${guild_id}/guildMembers`)
    .then(data => {
        const items = data.map((o: any) => {
            return {
                id: o.id,
                icon: o.avatar,
                content: o.username,
            }
        });

        setMembers(items);
    }).catch(error => console.error(error));

    callAPI(`/guilds/${guild_id}/clanMembers`)
    .then(data => {
        setClanMembers(data);
    }).catch(error => console.error(error));

    callAPI(`/guilds/${guild_id}/connected`)
    .then(data => {
        setConnected(data);
    }).catch(error => console.error(error));

    return (
        <div class={styles.container}>
            <For each={clanMembers()}>
                {
                    (member: any) => (
                        <div id={member.uid} class={styles.item}>
                            <p>{member.nickname}</p>
                            <Dropdown items={members()} selected={connected().find(o => o.clan_uid === member.uid)?.guild_uid}/>
                        </div>
                    )
                }
            </For>
                
        </div>
    );
};

export default Members;