import { useParams } from "@solidjs/router";
import { Component, createEffect, createResource, createSignal, For, Match, Show, Suspense, Switch } from "solid-js";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";

import styles from './Members.module.css';
import { produce } from "solid-js/store";
import { createForm } from "../../shared/form";
import { ResourcePicker } from "../../components/ResourcePicker";
import { extractResourceKey, getAvatarUrl } from "../../shared/utils";
import Toggle from "../../components/Toggle";

const Members: Component = () => {
    const params = useParams();
    const guild_id = params.id;

    const [showDetailIndex, setShowDetailIndex] = createSignal<number>(-1);
    const [selectedDiscordMember, setSelectedDiscordMember] = createSignal<API.GuildDiscordMember | null>(null);

    const [guildResource, { refetch: refetchGuildInfo }] = createResource(
        () => guild_id,
        API.getGuildInfo
    );

    const [membersResource, { refetch: refetchMembers }] = createResource(
        () => guild_id,
        async (id) => {
            const res = await API.getGuildMembers(id);
            const formatted: { [clan_uid: string]: API.GuildMember } = {};
            for(const member of res) {
                formatted[member.clan_uid] = member;
            }

            return formatted;
        }
    );

    const milestoneForm = createForm(() => ({
        channel: extractResourceKey(guildResource, 'milestone')?.channel,
        enabled: extractResourceKey(guildResource, 'milestone') ? true : false
    }));

    const chatForm = createForm(() => ({
        channel: extractResourceKey(guildResource, 'chat')?.channel,
        enabled: extractResourceKey(guildResource, 'chat') ? true : false
    }));

    const membersForm = createForm(() => {
        if(membersResource.loading || membersResource.error) return {};

        const members = membersResource();
        if(!members) return {};

        return structuredClone(members);
    });

    createEffect(() => {
        const index = showDetailIndex();
        const member = Object.values(membersForm.state)[index];

        setSelectedDiscordMember(member?.discord ?? null);
    });

    const onSaveButtonClicked = async () => {
        const membersChanges = membersForm.changes();
        const milestoneChanges = milestoneForm.changes();
        const chatChanges = chatForm.changes();

        if(membersChanges) {
            console.log("Saving member changes...", membersChanges);

            try {
                for(const [clan_uid, member] of Object.entries(membersChanges)) {
                    if(!member) continue;

                    if(!member.discord) {
                        await API.patchGuildMemberLink(guild_id!, clan_uid, null);
                    } else {
                        await API.patchGuildMemberLink(guild_id!, clan_uid, member.discord.user_id);
                    }
                }
            } catch(error) {
                console.error("Failed to save member changes", error);
                membersForm.reset();
            }
        }

        if(milestoneChanges) {
            console.log("Saving milestone changes...", milestoneChanges);

            try {
                if('enabled' in milestoneChanges && !milestoneChanges.enabled) {
                    await API.unsetGuildMilestone(guild_id!);
                } else {
                    await API.setGuildMilestone(guild_id!, {
                        channel: milestoneChanges.channel?.id
                    });
                }
            } catch(error) {
                console.error("Error saving milestone changes:", error);
                milestoneForm.reset();
            }
        }

        if(chatChanges) {
            console.log("Saving chat changes...", chatChanges);

            try {
                if('enabled' in chatChanges && !chatChanges.enabled) {
                    await API.unsetGuildChat(guild_id!);
                } else {
                    await API.setGuildChat(guild_id!, {
                        channel: chatChanges.channel?.id
                    });
                }
            } catch(error) {
                console.error("Error saving chat changes:", error);
                chatForm.reset();
            }
        }

        if(!membersChanges && !milestoneChanges && !chatChanges) {
            console.log("No changes to save");
            return;
        }

        try {
            await refetchMembers();
            await refetchGuildInfo();
        } catch(error) {
            console.error("Failed to refetch members after saving changes", error);
        }

        setShowDetailIndex(-1);
    };

    return (
        <Show when={!guildResource.loading && !guildResource.error && !membersResource.loading && !membersResource.error} fallback={<SpinLoader></SpinLoader>}>
            <div class='top'>
                <h1>Members</h1>
                <button class={styles.save_button} onClick={onSaveButtonClicked}>Save</button>
            </div>
            <div class={styles.main}>
                <div class={styles.left_section}>
                    <div class={styles.category}>
                        <div class={styles.category_top}>
                            <h2 class={styles.category_header}>Milestones</h2>
                            <Toggle checked={milestoneForm.state.enabled} callback={checked => milestoneForm.setState("enabled", checked)}/>
                        </div>

                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: !milestoneForm.state.enabled }}>
                                <p class={styles.property_title}>Channel</p>
                                <ResourcePicker
                                    title="Select milestone channel"
                                    value={milestoneForm.state.channel}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const channels = await API.getGuildDiscordChannels(guild_id!);
                                        return channels
                                            .map((c) => ({ id: c.id, name: c.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(channel) => {
                                        milestoneForm.setState("channel", {
                                            id: channel.id,
                                            name: channel.name,
                                            valid: true,
                                        });
                                    }}
                                    renderValue={(channel) => <p class="text-white">#{channel.name}</p>}
                                />
                            </div>
                        </div>
                    </div>

                    <div class={styles.category}>
                        <div class={styles.category_top}>
                            <h2 class={styles.category_header}>Chat</h2>
                            <Toggle checked={chatForm.state.enabled} callback={checked => chatForm.setState("enabled", checked)}/>
                        </div>
                        
                        <div class={styles.properties}>
                            <div class={styles.property} classList={{ [styles.disabled]: !chatForm.state.enabled }}>
                                <p class={styles.property_title}>Channel</p>
                                <ResourcePicker
                                    title="Select chat channel"
                                    value={chatForm.state.channel}
                                    placeholder="Not set"
                                    loadItems={async () => {
                                        const channels = await API.getGuildDiscordChannels(guild_id!);
                                        return channels
                                            .map((c) => ({ id: c.id, name: c.name }))
                                            .sort((a, b) => a.name.localeCompare(b.name));
                                    }}
                                    onSelect={(channel) => {
                                        chatForm.setState("channel", {
                                            id: channel.id,
                                            name: channel.name,
                                            valid: true,
                                        });
                                    }}
                                    renderValue={(channel) => <p class="text-white">#{channel.name}</p>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class={styles.category}>
                    <h2>Connected</h2>
                    <div class={styles.member_list}>
                        <For each={Object.values(membersForm.state)}>
                            {(member, index) => (
                                <div id={member.clan_uid} class="flex flex-col text-white">
                                    <button 
                                        class="grid grid-cols-2 p-2 hover:bg-gray-700/50 transition-colors"
                                        classList={{ 'bg-gray-700/50': showDetailIndex() === index() }}
                                        onclick={() => setShowDetailIndex(index())}
                                    >
                                        <div class="flex flex-row items-center gap-2">
                                            <Switch>
                                                <Match when={member.discord?.avatar}>
                                                    <img 
                                                        class="rounded-full w-8 h-8"
                                                        src={getAvatarUrl(member.discord!.user_id, member.discord!.avatar)} 
                                                        alt="Avatar" 
                                                    />
                                                </Match>
                                                <Match when={!member.discord?.avatar}>
                                                    <div class="rounded-full overflow-hidden w-8 h-8 flex items-center justify-center bg-gray-500">
                                                        <p class="text-xs uppercase">{member.nickname.slice(0, 2)}</p>
                                                    </div>
                                                </Match>
                                            </Switch>
                                            <p>{member.nickname}</p>
                                        </div>
                                        <div class="flex flex-row items-center gap-2">
                                            <Switch>
                                                <Match when={member.discord}>
                                                    <p>{member.discord!.username}</p>
                                                </Match>
                                                <Match when={!member.discord}>
                                                    <p class="italic text-sm">Not connected</p>
                                                </Match>
                                            </Switch>
                                        </div>
                                    </button>
                                    <Show when={showDetailIndex() === index()}>
                                        <div class="p-2 bg-gray-700">
                                            <p class="text-xs uppercase font-semibold">Discord connection</p>
                                            <div class="flex items-center gap-2">
                                                <ResourcePicker
                                                    title="Select Discord account"
                                                    value={selectedDiscordMember()}
                                                    placeholder="Select discord account"
                                                    disabled={member.discord != null}

                                                    class="grow"

                                                    loadItems={() => API.listGuildDiscordMembers(guild_id!)}
                                                    onSelect={setSelectedDiscordMember}
                                                    renderValue={(user) => (
                                                        <div class="flex items-center gap-2">
                                                            <img class="h-6 w-6 rounded-full" src={getAvatarUrl(user.user_id, user.avatar)} alt="" />
                                                            <p class="text-white">{user.username}</p>
                                                        </div>
                                                    )}
                                                />
                                                <Switch>
                                                    <Match when={member.discord == null}>
                                                        <button 
                                                            class="rounded-md border py-2 px-4 text-sm disabled:bg-gray-600 disabled:border-gray-600 disabled:cursor-not-allowed"
                                                            onclick={() => {
                                                                if(!selectedDiscordMember()) return;

                                                                const selected = selectedDiscordMember()!;
                                                                membersForm.setState(member.clan_uid, produce((member) => {
                                                                    member.discord = {
                                                                        user_id: selected.user_id,
                                                                        username: selected.username,
                                                                        avatar: selected.avatar,
                                                                        cached_at: new Date(),
                                                                    };
                                                                }));
                                                            }}
                                                            disabled={!selectedDiscordMember()}
                                                        >
                                                            Connect
                                                        </button>
                                                    </Match>
                                                    <Match when={member.discord != null}>
                                                        <button 
                                                            class="rounded-md border py-2 px-4 text-sm disabled:bg-gray-600 disabled:border-gray-600 disabled:cursor-not-allowed"
                                                            onclick={() => {
                                                                setSelectedDiscordMember(null);
                                                                membersForm.setState(member.clan_uid, produce((member) => {
                                                                    delete member.discord;
                                                                }));
                                                            }}
                                                        >
                                                            Disconnect
                                                        </button>
                                                    </Match>
                                                </Switch>
                                            </div>
                                        </div>
                                    </Show>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </div>
        </Show>
    );
};

export default Members;