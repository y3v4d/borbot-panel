import { useNavigate, useParams } from "@solidjs/router";
import { Component, createMemo, createResource, createSignal, onCleanup, onMount, Show } from "solid-js";
import SavePopup from "../../components/SavePopup";
import AddBot from "../../components/AddBot";
import styles from './Setup.module.css';
import { API } from "../../shared/api";

const Setup: Component = () => {
    const navigate = useNavigate();
    const params = useParams();
    const guild_id = params.id!;

    let botCheckInterval: any = null;

    const [guild, { refetch: refetchGuild }] = createResource(async () => {
        const res = await API.getGuildInfo(guild_id);
        console.log(`[GUILD INFO FETCHED FOR ${guild_id}]`, res);

        return res;
    })

    const isBotAdded = createMemo(() => {
        if(guild.loading) return false;

        const data = guild();
        return data ? data.is_joined : false;
    });

    const [showPopup, setShowPopup] = createSignal(false);

    onCleanup(() => {
        if(botCheckInterval) {
            clearInterval(botCheckInterval);
        }
    })

    const onAddBotSuccess = () => {
        if(botCheckInterval) {
            console.warn("Bot check interval already running, skipping...");
            return;
        }

        let processing = false;
        botCheckInterval = setInterval(async () => {
            if(processing) return;

            processing = true;
            if(isBotAdded()) {
                clearInterval(botCheckInterval);
                return;
            }

            try {
                await refetchGuild();
            } catch(error) {
                console.error("Error fetching guild info:", error);
            } finally {
                processing = false;
            }
        }, 1000);
    }

    const onSaveComplete = async (error: any) => {
        try {
            await refetchGuild();
            navigate(`/dashboard`);
        } catch(err) {
            console.error("Error fetching guild info:", err);
        } finally {
            setShowPopup(false);
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