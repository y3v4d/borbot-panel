import { Component } from "solid-js";
import styles from './Toggle.module.css';

interface ToggleProperties {
    callback?: (checked: boolean) => void
}

const Toggle: Component<ToggleProperties> = (props) => {
    const onToggleSwitched = (event: Event) => {
        const target = event.target as HTMLInputElement;
        
        if(props.callback) props.callback(target.checked);
    }

    return (
        <label class={styles.main}>
            <input checked={true} type="checkbox" onChange={onToggleSwitched}></input>
            <span class={styles.toggle}></span>
        </label>
    )
}

export default Toggle;