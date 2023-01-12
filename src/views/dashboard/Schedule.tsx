import { useParams } from "@solidjs/router";
import { Component, createSignal, For, Show } from "solid-js";
import Dropdown from "../../components/Dropdown";
import SpinLoader from "../../components/SpinLoader";
import { API } from "../../shared/api";

import styles from './Schedule.module.css';

const Schedule: Component = () => {
    const [entries, setEntries] = createSignal<API.GuildScheduleEntry[]>([]);
    const [members, setMembers] = createSignal<any[]>([]);

    const params = useParams();
    const guild_id = params.id;

    const onSubmitButtonClicked = async () => {
        const result = await API.postGuildSchedule(guild_id, entries());
        console.log(result);
    };

    API.getGuildSchedule(guild_id).then(data => {
        setEntries(data.entries);
        console.log(data);
    }).catch(error => console.error(error));

    API.getGuildMembers(guild_id).then(data => {
        const guildMembers = data.guild.map((o) => {
            return {
                id: o.id,
                icon: o.avatar,
                content: o.username
            }
        });

        setMembers(guildMembers);
    });

    return (
        <Show when={entries().length > 0 && members().length > 0} fallback={<SpinLoader></SpinLoader>}>
            <div class={styles.top}>
                <h1>Schedule</h1>
                <button class={styles.save_btn} onClick={onSubmitButtonClicked}>
                    <span class='material-icons'>done</span>
                </button>
            </div>
            <For each={entries()}>
                {
                    entry => (
                        <div id={entry.index.toString()} class={styles.item}>
                            <p class={styles.item_p}>{entry.index}</p>
                            <Dropdown 
                                items={members()}
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