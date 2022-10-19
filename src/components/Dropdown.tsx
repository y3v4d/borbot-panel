import { Component, createEffect, createSignal, For, Show } from "solid-js";

import styles from './Dropdown.module.css';

const Dropdown: Component<any> = (params) => {
    const [dropped, setDropped] = createSignal(false);
    const [selected, setSelected] = createSignal('');
    const [option, setOption] = createSignal<any>(undefined);

    createEffect(() => {
        if(params.items) setOption(params.items.find((o: any) => o.id === selected()));
    });

    const onItemClicked = (event: Event) => {
        const element: HTMLElement = (event.target as HTMLElement).closest('div')!;
        setSelected(element.id);

        if(params.callback) params.callback(element.id);
    }

    if(params.selected) setSelected(params.selected);

    return (
        <div id="dropdown" class={styles.dropdown} onClick={() => setDropped(!dropped())}>
            <div id={option() ? option().id : ""} class={styles.item}>
                <Show when={option()} fallback={<div class={styles.img_temp}></div>}>
                    <img src={option().icon}></img>
                    <p>{option().content}</p>
                </Show>
            </div>
            <div class={styles.list} classList={{[styles.show]: dropped()}}>
                <For each={params.items}>
                    {
                        (item: any) => (
                            <div 
                                id={item.id} 
                                class={styles.item} 
                                classList={{[styles.selected]: selected() == item.id}} 
                                onClick={onItemClicked}
                            >
                                <img src={item.icon}></img>
                                <p>{item.content}</p>
                            </div>
                        )
                    }
                </For>
            </div>
        </div>
    )
}

export default Dropdown;