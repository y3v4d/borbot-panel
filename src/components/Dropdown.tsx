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
    no_icon?: boolean,
    nullable?: boolean,
    hide_border?: boolean,
    locked?: boolean
}

const Dropdown: Component<DropdownProperties> = (props) => {
    let container: HTMLDivElement | undefined;
    let list: HTMLDivElement | undefined;

    const [dropped, setDropped] = createSignal(false);
    const [selected, setSelected] = createSignal('');
    const [option, setOption] = createSignal<DropdownItem | null>(null);

    if(props.nullable === undefined) props.nullable = true;
    if(props.locked === undefined) props.locked = false;

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

    const onDropdownClicked = () => {
        if(props.locked || (option() && !dropped() && props.items.length == 1)) return;

        setDropped(!dropped())
    }

    const onRemoveClicked = (event: Event) => {
        setSelected("");
        if(props.callback) props.callback("");
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
            classList={{ 
                [styles.dropdown_dropped]: dropped(), 
                [props.up ? styles.border_bottom : styles.border_top]: dropped(),
                [styles.dropdown_border]: !props.hide_border,
                [styles.disabled]: props.locked
            }}
            ref={container} 
            onClick={onDropdownClicked}
        >
            <div class={styles.lock}></div>
            <div id={option()?.id || ""} class={styles.item_selected}>
                <Show when={!props.no_icon}>
                    <Show when={option()?.icon} fallback={<div class={styles.icon}></div>}>
                        <img class={styles.icon} src={option()?.icon}></img>
                    </Show>
                </Show>
                <Show when={option()} fallback={<div class={styles.filler}></div>}>
                    <p class={styles.content}>{option()?.content}</p>
                </Show>
            </div>
            <div 
                class={styles.list} 
                classList={{[styles.show]: dropped(), [styles.going_up]: props.up}}
                ref={list}
            >
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
                                    <img class={styles.icon} src={item.icon}></img>
                                </Show>
                                <p class={styles.content}>{item.content}</p>
                            </div>
                        )
                    }
                </For>
            </div>
            <Show when={option() && props.nullable && (dropped() || props.items.length == 1)}>
                <span 
                    class={`material-icons md-bold ${styles.remove}`}
                    onClick={onRemoveClicked}
                >
                    close
                </span>
            </Show>
        </div>
    )
}

export default Dropdown;