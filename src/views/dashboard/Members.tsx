import { useParams } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";
import GuildCache, { ClanMember } from "../../shared/cache";

import styles from './Members.module.css';

const Members: Component = () => {
    const [clanMembers, setClanMembers] = createSignal<ClanMember[]>([]);
    const [guildMembersList, setGuildMembersList] = createSignal<DropdownItem[]>([]);
    const [connected, setConnected] = createSignal<API.GuildConnected[]>([]);

    const params = useParams();
    const guild_id = params.id;

    const guild = GuildCache.getGuild(guild_id)!;

    const onSubmitButtonClicked = async () => {
        const result = await API.postGuildConnected(guild_id, connected());
        console.log(result);
    };

    API.getGuildConnected(guild_id).then(async data => {
        console.log(`[NEW CONNECTED LIST]`, data);
        setConnected(data);

        await guild.fetchMembers();

        const list: DropdownItem[] = [];
        for(const member of guild.members) {
            if(member.isBot) continue;

            list.push({
                id: member.id,
                icon: member.avatar,
                content: member.username
            });
        }

        list.sort((self, other) => {
            return self.content.toLowerCase().charCodeAt(0) - other.content.toLowerCase().charCodeAt(0);
        });

        guild.clanMembers.sort((self, other) => {
            return self.nickname.toLowerCase().charCodeAt(0) - other.nickname.toLowerCase().charCodeAt(0);
        });

        setClanMembers(guild.clanMembers);
        setGuildMembersList(list);
    }).catch(error => console.error(error))

    return (
        <Show when={guildMembersList().length > 0} fallback={<SpinLoader></SpinLoader>}>
            <h1 class={styles.header}>Members</h1>
            <div class={styles.container}>
                <For each={clanMembers()}>
                    {
                        (member, index) => (
                            <div id={member.uid} class={styles.item}>
                                <p>{member.nickname}</p>
                                <Dropdown 
                                    items={guildMembersList()} 
                                    selected={connected().find(o => o.clan_uid === member.uid)?.guild_uid}
                                    callback={(id: string) => {
                                        const current = connected();
                                        const option = current.find(o => o.clan_uid === member.uid);
                                        
                                        if(option) option.guild_uid = id;
                                        else current.push({ guild_uid: id, clan_uid: member.uid });

                                        setConnected(current);
                                    }}
                                    up={index() >= clanMembers().length - 2}
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