import { useParams } from "@solidjs/router";
import { Component, createResource, For, Show } from "solid-js";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";
import GuildCache from "../../shared/cache";
import styles from './Raid.module.css';

const ROMAN = [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X' ];

const Raid: Component = () => {
    const params = useParams();
    const guild_id = params.id;

    const [memberList] = createResource(guild_id, fetchGuildMembers);
    const [channelList] = createResource(guild_id, fetchChannelList);
    const [roleList] = createResource(guild_id, fetchGuildRoles);

    const [raidInformation] = createResource(guild_id, fetchRaidInformation);
    const [schedule] = createResource(guild_id, fetchSchedule);

    const onSaveButtonClicked = async () => {
        if(schedule.loading || raidInformation.loading) return;

        const scheduleResult = await API.postGuildSchedule(
            guild_id,
            schedule()!.entries,
            schedule()!.schedule_channel,
            new Date(schedule()!.start)
        );

        const raidResult = await API.postGuildRaid(
            guild_id,
            raidInformation()!.announcement_channel,
            raidInformation()!.fight_role,
            raidInformation()!.claim_role,
            raidInformation()!.remind_channel
        )

        console.log(scheduleResult);
        console.log(raidResult);
    }

    return (
        <Show 
            when={!schedule.loading && !channelList.loading && !roleList.loading && !raidInformation.loading && !memberList.loading} 
            fallback={<SpinLoader></SpinLoader>}
        >
            <div class={styles.top}>
                <h1>Raid</h1>
                <button class={styles.save_button} onClick={onSaveButtonClicked}>Save</button>
            </div>
            <div class={styles.main}>
                <div class={styles.flex_row}>
                    <div class={styles.category}>
                        <h2 class={styles.category_header}>Announcements</h2>

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={raidInformation()?.announcement_channel}
                                    no_icon={true}
                                    callback={id => { raidInformation()!.announcement_channel = id; }}
                                />
                            </div>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Fighter role</p>
                                <Dropdown
                                    items={roleList()!}
                                    selected={raidInformation()?.fight_role}
                                    no_icon={true}
                                    callback={id => { raidInformation()!.fight_role = id; }}
                                />
                            </div>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Claim role</p>
                                <Dropdown
                                    items={roleList()!}
                                    selected={raidInformation()?.claim_role}
                                    no_icon={true}
                                    callback={id => {raidInformation()!.claim_role = id; }}
                                />
                            </div>
                        </div>
                    </div>

                    <div class={styles.category}>
                        <h2 class={styles.category_header}>Claim Reminder</h2>

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={raidInformation()?.remind_channel}
                                    no_icon={true}
                                    callback={id => { raidInformation()!.remind_channel = id; }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class={styles.category}>
                    <h2 class={styles.category_header}>Schedule</h2>

                    <div class={styles.category_schedule_container}>
                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Channel</p>
                                <Dropdown
                                    items={channelList()!}
                                    selected={schedule()?.schedule_channel}
                                    no_icon={true}
                                    callback={id => { schedule()!.schedule_channel = id }}
                                />
                            </div>

                            <div class={styles.property}>
                                <p class={styles.property_title}>Cycle start</p>
                                <input 
                                    class={styles.date} 
                                    type='date' 
                                    value={new Date(schedule()!.start).toLocaleDateString('en-CA')} 
                                    onChange={(event) => {
                                        const target = event.target as HTMLInputElement;
                                        schedule()!.start = target.valueAsDate!.toISOString();
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
                                                    items={memberList()!}
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

async function fetchRaidInformation(id: string) {
    const raid = await API.getGuildRaid(id);

    console.log(`[RAID]`, raid);
    return raid;
}

async function fetchGuildMembers(id: string) {
    const guild = GuildCache.getGuild(id);
    if(!guild) {
        throw new Error(`No guild with ${id}`);
    }

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

    return list;
}

async function fetchSchedule(id: string) {
    const schedule = await API.getGuildSchedule(id);

    console.log(`[SCHEDULE]`, schedule);
    return schedule;
}

export default Raid;