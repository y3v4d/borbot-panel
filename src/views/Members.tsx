import { useParams } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import Dropdown from "../components/Dropdown";
import SpinLoader from "../components/SpinLoader";
import { API } from "../shared/api";

import styles from './Members.module.css';

const Members: Component = () => {
    const [clanMembers, setClanMembers] = createSignal<any[]>([]);
    const [members, setMembers] = createSignal<any[]>([]);
    const [connected, setConnected] = createSignal<API.GuildConnected[]>([]);

    const params = useParams();
    const guild_id = params.id;

    const onSubmitButtonClicked = async () => {
        const result = await API.postGuildConnected(guild_id, connected());
        console.log(result);
    };

    API.getGuildConnected(guild_id).then(data => {
        console.log(`[NEW CONNECTED LIST]`, data);
        setConnected(data);

        API.getGuildMembers(guild_id).then(data => {
            console.log(data);

            const guildMembers = data.guild.map((o) => {
                return {
                    id: o.id,
                    icon: o.avatar,
                    content: o.username,
                }
            });

            data.clan.sort((self, other) => {
                return self.nickname.toLowerCase().charCodeAt(0) - other.nickname.toLowerCase().charCodeAt(0);
            })

            setClanMembers(data.clan);
            setMembers(guildMembers);
        }).catch(error => console.error(error));
    }).catch(error => console.error(error))

    return (
        <Show when={members().length > 0} fallback={<SpinLoader></SpinLoader>}>
            <h1 class={styles.header}>Members</h1>
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
                                        
                                        if(option) option.guild_uid = id;
                                        else current.push({ guild_uid: id, clan_uid: member.uid });

                                        setConnected(current);
                                    }}
                                />
                            </div>
                        )
                    }
                </For>
            </div>
            <button class={styles.save_btn} onClick={onSubmitButtonClicked}>
                <span class='material-icons'>done</span>
            </button>
        </Show>
    );
};

export default Members;