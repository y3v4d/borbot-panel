import { Component, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import styles from './Dropdown.module.css';

export interface DropdownItem {
    id: string,
    content: string,
    icon?: string
}

interface DropdownProperties {
    items: DropdownItem[],
    up?: boolean,
    callback?: (id: string) => void,
    selected?: string,
    no_icon?: boolean
}

const Dropdown: Component<DropdownProperties> = (props) => {
    let container: HTMLDivElement | undefined;

    const [dropped, setDropped] = createSignal(false);
    const [selected, setSelected] = createSignal('');
    const [option, setOption] = createSignal<DropdownItem | null>(null);

    onMount(() => {
        document.addEventListener('click', onFocusLost);
    });

    onCleanup(() => {
        document.removeEventListener('click', onFocusLost);
    });

    createEffect(() => {
        if(props.items) setOption(props.items.find((o) => o.id === selected()) || null);
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

        if(props.callback) props.callback(element.id);
    }

    if(props.selected) setSelected(props.selected);

    return (
        <div 
            id="dropdown" 
            class={styles.dropdown}
            classList={{ [styles.dropdown_dropped]: dropped(), [props.up ? styles.border_bottom : styles.border_top]: dropped() }}
            ref={container!} 
            onClick={() => setDropped(!dropped())}
        >
            <div id={option()?.id || ""} class={styles.item_selected}>
                <Show when={!props.no_icon}>
                    <Show when={option()} fallback={<div class={styles.img_temp}></div>}>
                        <img class={styles.icon} src={option()?.icon || ""}></img>
                    </Show>
                </Show>
                <p class={styles.content} classList={{[styles.content_low]: props.no_icon}}>{option()?.content || "None"}</p>
            </div>
            <div class={styles.list} classList={{[styles.show]: dropped(), [styles.going_up]: props.up}}>
                <For each={props.items}>
                    {
                        (item) => (
                            <div 
                                id={item.id} 
                                class={styles.item} 
                                classList={{[styles.selected]: selected() == item.id}} 
                                onClick={onItemClicked}
                            >
                                <Show when={!props.no_icon}>
                                    <img class={styles.icon} src={item.icon || ""}></img>
                                </Show>
                                <p class={styles.content} classList={{[styles.content_low]: props.no_icon}}>{item.content}</p>
                            </div>
                        )
                    }
                </For>
            </div>
        </div>
    )
}

export default Dropdown;