import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";
import SavePopup from "../../components/SavePopup";
import { updateGuildData } from "../../shared/cache";
import AddBot from "../../components/AddBot";
import styles from './Setup.module.css';

const Setup: Component<{ guild?: any, onFinish?: () => void }> = (props) => {
    const params = useParams();

    const [isBotAdded, setIsBotAdded] = createSignal(props.guild?.is_joined || false);
    const [showPopup, setShowPopup] = createSignal(false);

    console.log(props.guild);

    let isClanAdded = props.guild?.is_setup || false;

    console.log(`isBotAdded: ${isBotAdded()} isClanAdded: ${isClanAdded}`);

    const onAddBotSuccess = () => {
        setIsBotAdded(true);
    }

    const onSaveComplete = async (error: any) => {
        if(error) {
            console.error(error);

            try {
                const data = await updateGuildData(params.id);
                
                isClanAdded = data.is_setup;
                setIsBotAdded(data.is_joined);
                setShowPopup(false);
            } catch(error: any) {
                console.error(error);
            }

            return;
        }

        isClanAdded = true;

        if(isClanAdded && isBotAdded()) {
            updateGuildData(params.id);
        }
    }

    return (
        <div class={styles.container}>
            <div>
                <h1 class={styles.top_title}>Initial Setup</h1>
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