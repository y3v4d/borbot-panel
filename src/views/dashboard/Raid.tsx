import { useParams } from "@solidjs/router";
import { Component, createResource, For, Match, Show, Suspense, Switch } from "solid-js";
import SpinLoader from "../../components/SpinLoader";
import Toggle from "../../components/Toggle";
import { API } from "../../shared/api";
import styles from './Raid.module.css';
import { createForm } from "../../shared/form";
import { ResourcePicker } from "../../components/ResourcePicker";
import { extractResourceKey, getAvatarUrl } from "../../shared/utils";

const ROMAN = [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X' ];

const Raid: Component = () => {
    const params = useParams();
    const guild_id = params.id;

    const [guildMembers] = createResource(guild_id, async (id) => {
        const res = await API.getGuildMembers(id);
        const formatted: { [clan_uid: string]: API.GuildMember } = {};
        for(const member of res) {
            formatted[member.clan_uid] = member;
        }

        return formatted;
    });

    const [guildResource, { refetch: refetchGuildInfo }] = createResource(
        () => guild_id,
        API.getGuildInfo
    );

    const announcementsForm = createForm(() => ({
        channel: extractResourceKey(guildResource, "raid")?.channel,
        fight_role: extractResourceKey(guildResource, "raid")?.fight_role,
        claim_role: extractResourceKey(guildResource, "raid")?.claim_role,
        enabled: extractResourceKey(guildResource, "raid") ? true : false
    }));

    const claimRemindForm = createForm(() => ({
        channel: extractResourceKey(guildResource, "remind")?.channel,
        enabled: extractResourceKey(guildResource, "remind") ? true : false
    }));

    const scheduleForm = createForm(() => ({
        channel: extractResourceKey(guildResource, "schedule")?.channel,
        cycle_start: extractResourceKey(guildResource, "schedule")?.cycle_start,
        list: extractResourceKey(guildResource, "schedule")?.list,
        enabled: extractResourceKey(guildResource, "schedule") ? true : false
    }));

    const onSaveButtonClicked = async () => {
        const raidChanges = announcementsForm.changes();
        const remindChanges = claimRemindForm.changes();
        const scheduleChanges = scheduleForm.changes();

        if(raidChanges) {
            console.log("Saving raid changes...", raidChanges);

            try {
                if('enabled' in raidChanges && !raidChanges.enabled) {
                    await API.unsetGuildRaid(guild_id!);
                } else {
                    await API.setGuildRaid(guild_id!, {
                        channel: raidChanges.channel?.id,
                        fight_role: raidChanges.fight_role?.id,
                        claim_role: raidChanges.claim_role?.id
                    });
                }
            } catch(error) {
                console.error("Error saving raid changes:", error);
                announcementsForm.reset();
            }
        }

        if(remindChanges) {
            console.log("Saving claim reminder changes...", remindChanges);

            try {
                if('enabled' in remindChanges && !remindChanges.enabled) {
                    await API.unsetGuildRemind(guild_id!);
                } else {
                    await API.setGuildRemind(guild_id!, {
                        channel: remindChanges.channel?.id
                    });
                }
            } catch(error) {
                console.error("Error saving claim reminder changes:", error);
                claimRemindForm.reset();
            }
        }

        if(scheduleChanges) {
            console.log("Saving schedule changes...", scheduleChanges);

            try {
                if('enabled' in scheduleChanges && !scheduleChanges.enabled) {
                    await API.unsetGuildSchedule(guild_id!);
                } else {
                    await API.setGuildSchedule(guild_id!, {
                        channel: scheduleChanges.channel?.id,
                        cycle_start: scheduleChanges.cycle_start,
                        list: "list" in scheduleChanges ? scheduleForm.state.list : undefined
                    });
                }
            } catch(error) {
                console.error("Error saving schedule changes:", error);
                scheduleForm.reset();
            }
        }

        if(!raidChanges && !remindChanges && !scheduleChanges) {
            console.log("No changes to save.");
            return;
        }

        try {
            await refetchGuildInfo();
        } catch(error) {
            console.error("Error refetching guild info after saving raid changes:", error);
        }
    }

    return (
        <Show when={!guildResource.loading && !guildResource.error && !guildMembers.loading && !guildMembers.error} fallback={<SpinLoader></SpinLoader>}>
            <div class='top'>
                <h1>Raid</h1>
                <button class={styles.save_button} onClick={onSaveButtonClicked}>Save</button>
            </div>
            <div class={styles.main}>
                <div class={styles.flex_row}>
                    <div class={styles.category}>
                        <div class={styles.category_top}>
                            <h2 class={styles.category_header}>Announcements</h2>
                            <Toggle checked={announcementsForm.state.enabled} callback={checked => announcementsForm.setState("enabled", checked)}/>
                        </div>

                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: !announcementsForm.state.enabled }}>
                                <p class={styles.property_title}>Channel</p>
                                <ResourcePicker
                                    title="Select raid announcement channel"
                                    value={announcementsForm.state.channel}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const channels = await API.getGuildDiscordChannels(guild_id!);
                                        return channels
                                            .map((c) => ({ id: c.id, name: c.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(channel) => {
                                        announcementsForm.setState("channel", {
                                            id: channel.id,
                                            name: channel.name,
                                            valid: true,
                                        });
                                    }}
                                    renderValue={(channel) => <p class="text-white">#{channel.name}</p>}
                                />
                            </div>
                            <div class={styles.property} classList={{ [styles.disabled]: !announcementsForm.state.enabled }}>
                                <p class={styles.property_title}>Fighter role</p>
                                <ResourcePicker
                                    title="Select fighter role"
                                    value={announcementsForm.state.fight_role}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const roles = await API.getGuildDiscordRoles(guild_id!);
                                        return roles
                                            .map((r) => ({ id: r.id, name: r.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(role) => {
                                        announcementsForm.setState("fight_role", {
                                            id: role.id,
                                            name: role.name,
                                            valid: true
                                        });
                                    }}
                                    renderValue={(role) => <p class="text-white">{role.name}</p>}
                                />
                            </div>
                            <div class={styles.property} classList={{ [styles.disabled]: !announcementsForm.state.enabled }}>
                                <p class={styles.property_title}>Claim role</p>
                                <ResourcePicker
                                    title="Select claim role"
                                    value={announcementsForm.state.claim_role}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const roles = await API.getGuildDiscordRoles(guild_id!);
                                        return roles
                                            .map((r) => ({ id: r.id, name: r.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(role) => {
                                        announcementsForm.setState("claim_role", {
                                            id: role.id,
                                            name: role.name,
                                            valid: true
                                        });
                                    }}
                                    renderValue={(role) => <p class="text-white">{role.name}</p>}
                                />
                            </div>
                        </div>
                    </div>

                    <div class={styles.category}>
                        <div class={styles.category_top}>
                            <h2>Claim Reminder</h2>
                            <Toggle checked={claimRemindForm.state.enabled} callback={ checked => claimRemindForm.setState("enabled", checked) }/>
                        </div>

                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: !claimRemindForm.state.enabled }}>
                                <p class={styles.property_title}>Channel</p>
                                <ResourcePicker
                                    title="Select claim reminder channel"
                                    value={claimRemindForm.state.channel}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const channels = await API.getGuildDiscordChannels(guild_id!);
                                        return channels
                                            .map((c) => ({ id: c.id, name: c.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(channel) => {
                                        claimRemindForm.setState("channel", {
                                            id: channel.id,
                                            name: channel.name,
                                            valid: true
                                        });
                                    }}
                                    renderValue={(channel) => <p class="text-white">#{channel.name}</p>}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class={styles.category}>
                    <div class={styles.category_top}>
                        <h2>Schedule</h2>
                        <Toggle checked={scheduleForm.state.enabled} callback={checked => scheduleForm.setState("enabled", checked) }/>
                    </div>

                    <div class={styles.category_schedule_container}>
                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: !scheduleForm.state.enabled }}>
                                <p class={styles.property_title}>Channel</p>
                                <ResourcePicker
                                    title="Select schedule channel"
                                    value={scheduleForm.state.channel}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const channels = await API.getGuildDiscordChannels(guild_id!);
                                        return channels
                                            .map((c) => ({ id: c.id, name: c.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(channel) => {
                                        scheduleForm.setState("channel", {
                                            id: channel.id,
                                            name: channel.name,
                                            valid: true
                                        });
                                    }}
                                    renderValue={(channel) => <p class="text-white">#{channel.name}</p>}
                                />
                            </div>

                            <div class={styles.property} classList={{ [styles.disabled]: !scheduleForm.state.enabled }}>
                                <p class={styles.property_title}>Cycle start</p>
                                <input 
                                    class={styles.date} 
                                    type='date' 
                                    value={new Date(scheduleForm.state.cycle_start || '').toLocaleDateString('en-CA')} 
                                    onChange={(event) => {
                                        const target = event.target as HTMLInputElement;
                                        const date = new Date(target.value);

                                        scheduleForm.setState("cycle_start", date);
                                    }}>
                                </input>
                            </div>
                        </div>

                        <div class={`${styles.property} ${styles.property_vertical}`} classList={{ [styles.disabled]: !scheduleForm.state.enabled }}>
                            <p class={styles.property_title}>List</p>
                            <div class={styles.schedule_list}>
                                <For each={scheduleForm.state.list || Array(10).fill(null)}>
                                    {(entry, index) => (
                                        <div class={styles.schedule_list_item}>
                                            <p class={styles.item_p}>{ROMAN[index()]}</p>
                                            <ResourcePicker
                                                title="Select member"
                                                value={guildMembers()?.[entry ?? ""] ?? null}
                                                placeholder="Untaken"

                                                loadItems={() => {
                                                    return Object.values(guildMembers() || {});
                                                }}

                                                onSelect={(member) => {
                                                    scheduleForm.setState("list", (prevList) => {
                                                        const newList = [...(prevList || Array(10).fill(null))];
                                                        newList[index()] = member.clan_uid;

                                                        return newList;
                                                    });
                                                }}

                                                renderValue={(member) => (
                                                    <div class="flex items-center gap-2">
                                                        <Switch>
                                                            <Match when={member.discord?.avatar}>
                                                                <img 
                                                                    class="rounded-full w-6 h-6"
                                                                    src={getAvatarUrl(member.discord!.user_id, member.discord!.avatar)} 
                                                                    alt="Avatar" 
                                                                />
                                                            </Match>
                                                            <Match when={!member.discord?.avatar}>
                                                                <div class="rounded-full overflow-hidden w-6 h-6 flex items-center justify-center bg-gray-500">
                                                                    <p class="text-xs uppercase text-white">{member.nickname.slice(0, 2)}</p>
                                                                </div>
                                                            </Match>
                                                        </Switch>
                                                        <p class="text-white">{member.nickname}</p>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
}

export default Raid;