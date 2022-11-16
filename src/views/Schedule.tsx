import { useParams } from "@solidjs/router";
import { Component, createSignal, For } from "solid-js";
import Dropdown from "../components/Dropdown";
import { callAPI } from "../shared/utils";

import styles from './Schedule.module.css';

const Schedule: Component = () => {
    const [entries, setEntries] = createSignal<any[]>([]);
    const [members, setMembers] = createSignal<any[]>([]);

    const params = useParams();
    const guild_id = params.id;

    const onSubmitButtonClicked = async () => {
        const result = await callAPI(`/guilds/${guild_id}/schedule`, { data: entries() }, 'post');
        console.log(result);
    };

    callAPI(`/guilds/${guild_id}/schedule`)
    .then(data => {
        setEntries(data.entries);
        console.log(data);
    });

    callAPI(`/guilds/${guild_id}/members`)
    .then(data => {
        const guildMembers = data.guild.map((o: any) => {
            return {
                id: o.id,
                icon: o.avatar,
                content: o.username
            }
        });

        setMembers(guildMembers);
    })

    return (
        <div>
            <div class={styles.top}>
                <h1>Schedule</h1>
                <button class={styles.save_btn} onClick={onSubmitButtonClicked}>
                    <span class='material-icons'>done</span>
                </button>
            </div>
            <For each={entries()}>
                {
                    (entry: any) => (
                        <div id={entry.index} class={styles.item}>
                            <p class={styles.item_p}>{entry.index}</p>
                            <Dropdown 
                                items={members()}
                                selected={entry.uid}
                                callback={(id: string) => {
                                    const current = entries();
                                    const found = current.find(o => o.index == entry.index);
                                    found.uid = id;

                                    setEntries(current);
                                }}
                            />
                        </div>
                    )
                }
            </For>
        </div>
    )
}

export default Schedule;