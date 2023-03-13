import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";
import SavePopup from "../../components/SavePopup";
import AddBot from "../../components/AddBot";
import styles from './Setup.module.css';
import GuildCache, { Guild } from "../../shared/cache";

const Setup: Component = () => {
    const params = useParams();

    const guild = GuildCache.getGuild(params.id)!;
    let isClanAdded = guild.is_setup;

    const [isBotAdded, setIsBotAdded] = createSignal(guild.is_joined);
    const [showPopup, setShowPopup] = createSignal(false);

    const onAddBotSuccess = () => {
        setIsBotAdded(true);
    }

    const onSaveComplete = async (error: any) => {
        if(error) {
            const guild = GuildCache.getGuild(params.id)!;

            isClanAdded = guild.is_setup;
            setIsBotAdded(guild.is_joined);
            setShowPopup(false);

            return;
        }

        isClanAdded = true;

        if(isClanAdded && isBotAdded()) {
            const cache = GuildCache.getGuild(params.id)!;
            await cache.fetch(true);
        }
    }

    return (
        <div class={styles.container}>
            <div class='top'>
                <h1>Initial Setup</h1>
            </div>
            <p class={styles.description}>
                To use the Borbot dashboard, you first have to add the bot to your Discord server and then upload the Clicker Heroes save to get clan credentials.
            </p>
            <div class={styles.steps_container}>
                <div class={styles.step_container}>
                    <h3 class={styles.step_title}>Step 1: Add the Borbot to your Discord server</h3>
                    <AddBot callback={onAddBotSuccess}></AddBot>
                    <Show when={isBotAdded()}>
                        <div class={styles.step_mask}>
                            <h2>Completed</h2>
                        </div>
                    </Show>
                </div>
                <div class={styles.step_container}>
                    <h3 class={styles.step_title}>Step 2: Add your clan by uploading your Clicker Heroes save file</h3>
                    <button class={styles.step_button} onClick={() => setShowPopup(true)}>Upload save file</button>
                    <Show when={!isBotAdded()}>
                        <div class={styles.step_mask}></div>
                    </Show>
                </div>
            </div>
            <Show when={showPopup()}>
                <SavePopup 
                    onClose={() => setShowPopup(false)}
                    onComplete={onSaveComplete}
                ></SavePopup>
            </Show>
        </div>
    );
};

export default Setup;