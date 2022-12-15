import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";
import SavePopup from "../components/SavePopup";
import { updateGuildData } from "../shared/cache";
import AddBot from "./AddBot";
import styles from './Setup.module.css';

const Setup: Component<{ guild?: any, onFinish?: () => void }> = (props) => {
    const navigate = useNavigate();
    const params = useParams();

    const [showPopup, setShowPopup] = createSignal(false);

    console.log(props.guild);

    let isBotAdded = props.guild?.is_joined || false;
    let isClanAdded = props.guild?.is_setup || false;

    console.log(`isBotAdded: ${isBotAdded} isClanAdded: ${isClanAdded}`);

    const onAddBotSuccess = () => {
        isBotAdded = true;
    }

    const onSaveSuccess = () => {
        isClanAdded = true;

        if(isClanAdded && isBotAdded) {
            updateGuildData(params.id);
        }
    }

    return (
        <>
            <h1>Setup</h1>
            <div class={styles.step_container}>
                <div>Step 1: Add the Borbot to your Discord Server</div>
                <AddBot callback={onAddBotSuccess}></AddBot>
            </div>
            <div class={styles.step_container}>
                <div>Step 2: Add your clan by uploading your Clicker Heroes save file</div>
                <button onClick={() => setShowPopup(true)}>Upload</button>
            </div>
            <Show when={showPopup()}>
                <SavePopup 
                    onClose={() => setShowPopup(false)}
                    onSuccess={onSaveSuccess}
                ></SavePopup>
            </Show>
        </>
    );
};

export default Setup;