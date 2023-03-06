import { useParams } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import Dropdown, { DropdownItem } from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";
import GuildCache from "../../shared/cache";

import styles from './Schedule.module.css';

const ROMAN = [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X' ];

const Schedule: Component = () => {
    const [entries, setEntries] = createSignal<API.GuildScheduleEntry[]>([]);
    const [guildMembersList, setGuildMembersList] = createSignal<DropdownItem[]>([]);
    const [guildChannelsList, setGuildChannelsList] = createSignal<DropdownItem[]>([]);
    const [guildRolesList, setGuildRolesList] = createSignal<DropdownItem[]>([]);

    const [raidAnnouncementChannel, setRaidAnnouncementChannel] = createSignal("");
    const [raidRemindChannel, setRaidRemindChannel] = createSignal("");
    const [raidFightRole, setRaidFightRole] = createSignal("");
    const [raidClaimRole, setRaidClaimRole] = createSignal("");

    const params = useParams();
    const guild_id = params.id;
    const guild = GuildCache.getGuild(guild_id)!;

    let schedule_channel = "";
    let schedule_start: Date | null = new Date('2022-04-02');

    let scheduleStartInput: HTMLInputElement | undefined;

    const onSubmitButtonClicked = async () => {
        const raidResult = await API.postGuildRaid(guild_id, raidAnnouncementChannel(), raidFightRole(), raidClaimRole(), raidRemindChannel());
        const result = await API.postGuildSchedule(guild_id, entries(), schedule_channel, scheduleStartInput?.valueAsDate || undefined);

        console.log(`raid: `, raidResult);
        console.log(`schedule: `, result);
    };

    API.getGuildRaid(guild_id).then(data => {
        setRaidAnnouncementChannel(data.announcement_channel);
        setRaidRemindChannel(data.remind_channel);
        setRaidFightRole(data.fight_role);
        setRaidClaimRole(data.claim_role);
    }).catch(error => console.error(error));

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

    API.getGuildRoles(guild_id).then(data => {
        const list: DropdownItem[] = [];
        for(const role of data) {
            if(role.name === '@everyone') continue;

            list.push({
                id: role.id,
                content: role.name
            });
        }

        list.sort((self, other) => {
            return self.content.charCodeAt(0) - other.content.charCodeAt(0);
        });

        console.log(list);

        setGuildRolesList(list);
    });

    API.getGuildSchedule(guild_id).then(async data => {
        setEntries(data.entries);
        console.log(`[SCHEDULE DATA]`, data);

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
        schedule_start = new Date(data.start);

        setGuildMembersList(list);
    }).catch(error => console.error(error));

    return (
        <Show 
            when={entries().length > 0 && guildMembersList().length > 0 && guildChannelsList().length > 0} 
            fallback={<SpinLoader></SpinLoader>}
        >

            <div class={styles.top}>
                <h1 class={styles.header}>Raid</h1>
                <button class={styles.save_btn} onClick={onSubmitButtonClicked}>
                    Save
                    <span class='material-icons'>save</span>
                </button>
            </div>
            <div class={styles.main}>
                <div class={styles.options}>
                    <div class={styles.subcategory}>
                        <h2 class={styles.schedule_title}>Announcements</h2>

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Announcement channel </p>
                                <Dropdown
                                    items={guildChannelsList()}
                                    selected={raidAnnouncementChannel()}
                                    no_icon={true}
                                    callback={id => setRaidAnnouncementChannel(id)}
                                />
                            </div>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Fighter role </p>
                                <Dropdown
                                    items={guildRolesList()}
                                    selected={raidFightRole()}
                                    no_icon={true}
                                    callback={id => setRaidFightRole(id)}
                                />
                            </div>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Claimer role </p>
                                <Dropdown
                                    items={guildRolesList()}
                                    selected={raidClaimRole()}
                                    no_icon={true}
                                    callback={id => setRaidClaimRole(id)}
                                />
                            </div>
                        </div>

                        <h2 class={styles.schedule_title}>Reminds</h2>

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Remind channel</p>
                                <Dropdown
                                    items={guildChannelsList()}
                                    selected={raidRemindChannel()}
                                    no_icon={true}
                                    callback={id => setRaidRemindChannel(id)}
                                />
                            </div>
                        </div>
                    </div>
                    <div class={styles.subcategory}>
                        <h2 class={styles.schedule_title}>Options</h2> 

                        <div class={styles.properties}>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Cycle start</p>
                                <input type="date" ref={scheduleStartInput} value={schedule_start.toLocaleDateString('en-CA')}></input>
                            </div>
                            <div class={styles.property}>
                                <p class={styles.property_title}>Schedule channel</p>
                                <Dropdown
                                    items={guildChannelsList()}
                                    selected={schedule_channel}
                                    no_icon={true}
                                    callback={(id: string) => {
                                        schedule_channel = id;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class={styles.container}>
                    <h2 class={styles.schedule_title}>Schedule</h2>
                    <div class={styles.schedule_list}>
                        <For each={entries()}>
                            {
                                entry => (
                                    <div id={entry.index.toString()} class={styles.item}>
                                        <p class={styles.item_p}>{ROMAN[entry.index - 1]}</p>
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
                    </div>
                </div>
            </div>
        </Show>
    )
}

export default Schedule;