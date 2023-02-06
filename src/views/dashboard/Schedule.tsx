import { useParams } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";
import GuildCache from "../../shared/cache";

import styles from './Schedule.module.css';

const Schedule: Component = () => {
    const [entries, setEntries] = createSignal<API.GuildScheduleEntry[]>([]);
    const [guildMembersList, setGuildMembersList] = createSignal<DropdownItem[]>([]);
    const [guildChannelsList, setGuildChannelsList] = createSignal<DropdownItem[]>([]);

    const params = useParams();
    const guild_id = params.id;
    const guild = GuildCache.getGuild(guild_id)!;
    let schedule_channel = "";

    const onSubmitButtonClicked = async () => {
        const result = await API.postGuildSchedule(guild_id, entries(), schedule_channel);
        console.log(result);
    };

    API.getGuildChannels(guild_id).then(data => {
        const list: DropdownItem[] = [];
        for(const channel of data) {
            list.push({
                id: channel.id,
                content: "#" + channel.name
            });
        }

        console.log(list);

        setGuildChannelsList(list);
    }).catch(error => {
        console.error(error);
    });

    API.getGuildSchedule(guild_id).then(async data => {
        setEntries(data.entries);
        console.log(data);

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

        schedule_channel = data.schedule_channel;

        setGuildMembersList(list);
    }).catch(error => console.error(error));

    return (
        <Show 
            when={entries().length > 0 && guildMembersList().length > 0 && guildChannelsList().length > 0} 
            fallback={<SpinLoader></SpinLoader>}
        >

            <div class={styles.top}>
                <h1 class={styles.header}>Schedule</h1>
                <button class={styles.save_btn} onClick={onSubmitButtonClicked}>
                    <span class='material-icons'>done</span>
                </button>
            </div>
            <div class={styles.channel_selector}>
                <p class={styles.channel_title}>Channel: </p>
                <Dropdown
                    items={guildChannelsList()}
                    selected={schedule_channel}
                    no_icon={true}
                    callback={(id: string) => {
                        schedule_channel = id;
                    }}
                />
            </div>
            <For each={entries()}>
                {
                    entry => (
                        <div id={entry.index.toString()} class={styles.item}>
                            <p class={styles.item_p}>{entry.index}</p>
                            <Dropdown 
                                items={guildMembersList()}
                                selected={entry.uid}
                                callback={(id: string) => {
                                    const current = entries();
                                    const found = current.find(o => o.index == entry.index)!;
                                    found.uid = id;

                                    setEntries(current);
                                }}
                            />
                        </div>
                    )
                }
            </For>
        </Show>
    )
}

export default Schedule;