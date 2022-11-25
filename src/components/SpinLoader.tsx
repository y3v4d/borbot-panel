import { Component } from "solid-js";

import styles from './SpinLoader.module.css';

const SpinLoader: Component = () => {
    return (
        <div class={styles.spinner}></div>
    );
}

export default SpinLoader;