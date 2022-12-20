import { Component, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";

import styles from './Dropdown.module.css';

const Dropdown: Component<any> = (params) => {
    const [dropped, setDropped] = createSignal(false);
    const [selected, setSelected] = createSignal('');
    const [option, setOption] = createSignal<any>(undefined);

    let container: HTMLDivElement | undefined;

    createEffect(() => {
        if(params.items) setOption(params.items.find((o: any) => o.id === selected()));
    });

    onMount(() => {
        document.addEventListener('click', onFocusLost);
    });

    onCleanup(() => {
        document.removeEventListener('click', onFocusLost);
    });

    const onFocusLost = (event: MouseEvent) => {
        const target = (event.target as HTMLElement).closest('#dropdown');
        if(!target || !target.isEqualNode(container!)) {
            setDropped(false);
        }
    }

    const onItemClicked = (event: Event) => {
        const element: HTMLElement = (event.target as HTMLElement).closest('div')!;
        setSelected(element.id);

        if(params.callback) params.callback(element.id);
    }

    if(params.selected) setSelected(params.selected);

    return (
        <div 
            id="dropdown" 
            class={styles.dropdown}
            classList={{ [styles.dropdown_dropped]: dropped(), [params.up ? styles.border_bottom : styles.border_top]: dropped() }}
            ref={container!} 
            onClick={() => setDropped(!dropped())}
        >
            <div id={option() ? option().id : ""} class={styles.item_selected}>
                <Show when={option()} fallback={<div class={styles.img_temp}></div>}>
                    <img class={styles.icon} src={option().icon}></img>
                    <p class={styles.content}>{option().content}</p>
                </Show>
            </div>
            <div class={styles.list} classList={{[styles.show]: dropped(), [styles.going_up]: params.up}}>
                <For each={params.items}>
                    {
                        (item: any) => (
                            <div 
                                id={item.id} 
                                class={styles.item} 
                                classList={{[styles.selected]: selected() == item.id}} 
                                onClick={onItemClicked}
                            >
                                <img class={styles.icon} src={item.icon}></img>
                                <p class={styles.content}>{item.content}</p>
                            </div>
                        )
                    }
                </For>
            </div>
        </div>
    )
}

export default Dropdown;