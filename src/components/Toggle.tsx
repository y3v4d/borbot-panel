import { Component } from "solid-js";
import styles from './Toggle.module.css';

const Toggle: Component = () => {
    return (
        <label class={styles.main}>
            <input type="checkbox"></input>
            <span class={styles.toggle}></span>
        </label>
    )
}

export default Toggle;