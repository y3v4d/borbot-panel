import { useParams } from "@solidjs/router";
import { Component, createResource, createSignal, For, Show } from "solid-js";
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

    const [channelList] = createResource(guild_id, fetchChannelList);

    const guild = GuildCache.getGuild(guild_id)!;

    const onSaveButtonClicked = async () => {
        const result = await API.postGuildConnected(guild_id, connected());
        const patchResult = await API.patchGuild(guild_id, { 
            milestone_channel: guild.milestone_channel,
            chat_channel: guild.chat_channel
        });

        console.log(result);
        console.log(patchResult);
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
        <Show when={guildMembersList().length > 0 && !channelList.loading} fallback={<SpinLoader></SpinLoader>}>
            <div class='top'>
                <h1>Members</h1>
                <button class={styles.save_button} onClick={onSaveButtonClicked}>Save</button>
            </div>
            <div class={styles.main}>
                <div class={styles.left_section}>
                    <div class={styles.category}>
                        <h2>Milestones</h2>

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={guild.milestone_channel}
                                    no_icon={true}
                                    callback={ id => guild.milestone_channel = id }
                                />
                            </div>
                        </div>
                    </div>

                    <div class={styles.category}>
                        <h2>Chat</h2>

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={guild.chat_channel}
                                    no_icon={true}
                                    callback={ id => guild.chat_channel = id }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class={styles.category}>
                    <h2>Connected</h2>
                    <div class={styles.member_list}>
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
                                            up={index() >= clanMembers().length - 3}
                                        />
                                    </div>
                                )
                            }
                        </For>
                    </div>
                </div>
            </div>
        </Show>
    );
};

async function fetchChannelList(id: string) {
    const channels = await API.getGuildChannels(id);

    const list: DropdownItem[] = [];
    for(const channel of channels) {
        list.push({
            id: channel.id,
            content: "#" + channel.name
        });
    }

    list.sort((self, other) => {
        return self.content.charCodeAt(1) - other.content.charCodeAt(1);
    });

    return list;
}

export default Members;