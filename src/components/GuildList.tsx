import { Component, createSignal, For, Show } from "solid-js";
import styles from './GuildList.module.css';

const GuildList: Component<any> = (props) => {
    const [dropped, setDropped] = createSignal(false);
    const [option, setOption] = createSignal<any>({});
    const [selected, setSelected] = createSignal('');

    const onItemClicked = (event: Event) => {
        const element: HTMLElement = (event.target as HTMLElement).closest('div')!;

        setOption({
            icon: element.querySelector('img')?.src,
            name: element.querySelector('p')?.textContent
        });
        setSelected(element.id);
    }

    return (
        <div class={styles.dropdown} onClick={() => setDropped(!dropped())}>
            <div class={styles.item}>
                <Show
                    when={selected()}
                    fallback={
                        <>
                            <div class={styles.img_temp}></div>
                            <p>Unknown</p>
                        </>
                        
                    }
                >
                        <img src={option().icon}></img>
                        <p>{option().name}</p>
                </Show>
            </div>
            <div class={styles.list} classList={{[styles.show]: dropped()}}>
                <For each={props.list}>
                    {
                        (guild: any) => (
                            <div id={guild.id} class={styles.item} classList={{[styles.selected]: selected() == guild.id}} onClick={onItemClicked}>
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