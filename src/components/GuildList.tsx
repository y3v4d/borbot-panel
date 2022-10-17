import { useNavigate } from "@solidjs/router";
import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { params } from "../../src_old/shared/router";
import { callAPI } from "../shared/utils";
import styles from './GuildList.module.css';

const ADMINISTRATOR_FLAG = (1 << 3);

const GuildList: Component<any> = (props) => {
    const navigate = useNavigate();

    const [dropped, setDropped] = createSignal(false);
    const [guilds, setGuilds] = createSignal<any[]>([]);
    const [selected, setSelected] = createSignal('');
    const [option, setOption] = createSignal<any>(undefined);

    createEffect(() => {
        setOption(guilds().find(o => o.id === selected()));
    });

    callAPI('/guilds', {}, 'get')
    .then(res => {
        if(res.code === 200) {
            const items: any[] = [];
            for(const item of res.items) {
                if((parseInt(item.permissions) & ADMINISTRATOR_FLAG) === ADMINISTRATOR_FLAG) {
                    items.push(item);
                }
            }

            setGuilds(items);
            setSelected(props.current);
        } else {
            console.error(`Error ${res.code}: ${res.msg}`);
        }
    }).catch(error => console.error(error));

    const onItemClicked = (event: Event) => {
        const element: HTMLElement = (event.target as HTMLElement).closest('div')!;
        setSelected(element.id);

        navigate(`/dashboard/${element.id}`);
    }

    return (
        <div class={styles.dropdown} onClick={() => setDropped(!dropped())}>
            <div class={styles.item}>
                <Show when={option()} fallback={<div class={styles.img_temp}></div>}>
                    <img src={option().icon}></img>
                    <p>{option().name}</p>
                </Show>
            </div>
            <div class={styles.list} classList={{[styles.show]: dropped()}}>
                <For each={guilds()}>
                    {
                        (guild: any) => (
                            <div 
                                id={guild.id} 
                                class={styles.item} 
                                classList={{[styles.selected]: selected() == guild.id}} 
                                onClick={onItemClicked}
                            >
                                <img src={guild.icon}></img>
                                <p>{guild.name}</p>
                            </div>
                        )
                    }
                </For>
            </div>
        </div>
    )
}

export default GuildList;