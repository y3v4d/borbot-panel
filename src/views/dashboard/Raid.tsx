import { useParams } from "@solidjs/router";
import { Component, createResource, createSignal, For, Show } from "solid-js";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import Toggle from "../../components/Toggle";
import { API } from "../../shared/api";
import GuildCache from "../../shared/cache";
import styles from './Raid.module.css';

const ROMAN = [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X' ];

const Raid: Component = () => {
    const params = useParams();
    const guild_id = params.id;

    const [announcementsLocked, setAnnouncementsLocked] = createSignal(false);
    const [remindersLocked, setRemindersLocked] = createSignal(false);

    const [connectedList] = createResource(guild_id, fetchConnectedMembersList);
    const [channelList] = createResource(guild_id, fetchChannelList);
    const [roleList] = createResource(guild_id, fetchGuildRoles);

    const [schedule] = createResource(guild_id, fetchSchedule);

    const guild = GuildCache.getGuild(guild_id)!;

    const onSaveButtonClicked = async () => {
        if(schedule.loading) return;

        const scheduleResult = await API.postGuildSchedule(
            guild_id,
            schedule()!.entries,
            schedule()!.channel,
            new Date(schedule()!.cycle_start)
        );

        const patchGuildResult = await API.patchGuild(guild_id, {
            raid_announcement_channel: guild.raid_announcement_channel,
            raid_fight_role: guild.raid_fight_role,
            raid_claim_role: guild.raid_claim_role,
            remind_channel: guild.remind_channel
        });
        
        console.log(scheduleResult);
        console.log(patchGuildResult);
    }

    return (
        <Show 
            when={!schedule.loading && !channelList.loading && !roleList.loading && !connectedList.loading} 
            fallback={<SpinLoader></SpinLoader>}
        >
            <div class='top'>
                <h1>Raid</h1>
                <button class={styles.save_button} onClick={onSaveButtonClicked}>Save</button>
            </div>
            <div class={styles.main}>
                <div class={styles.flex_row}>
                    <div class={styles.category}>
                        <div class={styles.category_top}>
                            <h2 class={styles.category_header}>Announcements</h2>
                            <Toggle callback={checked => setAnnouncementsLocked(!checked)}/>
                        </div>

                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: announcementsLocked() }}>
                                <p class={styles.property_title}>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={guild.raid_announcement_channel}
                                    no_icon={true}
                                    callback={id => { guild.raid_announcement_channel = id; }}
                                    locked={announcementsLocked()}
                                />
                            </div>
                            <div class={styles.property} classList={{ [styles.disabled]: announcementsLocked() }}>
                                <p class={styles.property_title}>Fighter role</p>
                                <Dropdown
                                    items={roleList()!}
                                    selected={guild.raid_fight_role}
                                    no_icon={true}
                                    callback={id => { guild.raid_fight_role = id; }}
                                    locked={announcementsLocked()}
                                />
                            </div>
                            <div class={styles.property} classList={{ [styles.disabled]: announcementsLocked() }}>
                                <p class={styles.property_title}>Claim role</p>
                                <Dropdown
                                    items={roleList()!}
                                    selected={guild.raid_claim_role}
                                    no_icon={true}
                                    callback={id => {guild.raid_claim_role = id; }}
                                    locked={announcementsLocked()}
                                />
                            </div>
                        </div>
                    </div>

                    <div class={styles.category}>
                        <div class={styles.category_top}>
                            <h2>Claim Reminder</h2>
                            <Toggle callback={ checked => setRemindersLocked(!checked) }/>
                        </div>

                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: remindersLocked() }}>
                                <p class={styles.property_title}>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={guild.remind_channel}
                                    no_icon={true}
                                    callback={id => { guild.remind_channel = id; }}
                                    locked={remindersLocked()}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class={styles.category}>
                    <div class={styles.category_top}>
                        <h2>Schedule</h2>
                    </div>

                    <div class={styles.category_schedule_container}>
                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={schedule()?.channel}
                                    no_icon={true}
                                    callback={id => { schedule()!.channel = id }}
                                />
                            </div>

                            <div class={styles.property}>
                                <p class={styles.property_title}>Cycle start</p>
                                <input 
                                    class={styles.date} 
                                    type='date' 
                                    value={new Date(schedule()!.cycle_start).toLocaleDateString('en-CA')} 
                                    onChange={(event) => {
                                        const target = event.target as HTMLInputElement;
                                        schedule()!.cycle_start = target.valueAsDate!.toISOString();
                                    }}>
                                </input>
                            </div>
                        </div>

                        <div class={`${styles.property} ${styles.property_vertical}`}>
                            <p class={styles.property_title}>List</p>
                            <div class={styles.schedule_list}>
                                <For each={schedule()?.entries}>
                                    {
                                        entry => (
                                            <div id={entry.index.toString()} class={styles.schedule_list_item}>
                                                <p class={styles.item_p}>{ROMAN[entry.index - 1]}</p>
                                                <Dropdown 
                                                    items={connectedList()!}
                                                    selected={entry.uid}
                                                    callback={(id: string) => {
                                                        const current = schedule()!.entries;
                                                        const found = current.find(o => o.index == entry.index)!;
                                                        found.uid = id;
                                                    }}
                                                />
                                            </div>
                                        )
                                    }
                                </For>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
}

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

async function fetchGuildRoles(id: string) {
    const roles = await API.getGuildRoles(id);

    const list: DropdownItem[] = [];
    for(const role of roles) {
        if(role.name === "@everyone") continue;

        list.push({
            id: role.id,
            content: role.name
        });
    }

    list.sort((self, other) => {
        return self.content.charCodeAt(0) - other.content.charCodeAt(0);
    });

    return list;
}

async function fetchConnectedMembersList(id: string) {
    const guild = GuildCache.getGuild(id);
    if(!guild) {
        throw new Error(`No guild with ${id}`);
    }
    await guild.fetchMembers();

    const connected = await API.getGuildConnected(id);

    const list: DropdownItem[] = [];
    for(const data of connected) {
        const member = guild.members.find(o => o.id === data.guild_uid);
        if(!member) {
            console.warn(`Couldn't find member with id ${data.guild_uid}`);
            continue;
        }

        list.push({
            id: member.id,
            icon: member.avatar,
            content: member.username
        });
    }

    return list;
}

async function fetchSchedule(id: string) {
    try {
        const schedule = await API.getGuildSchedule(id);

        console.log(`[SCHEDULE]`, schedule);
        return schedule;
    } catch(error: any) {
        console.error(error);
        return null;
    }
    
}

export default Raid;