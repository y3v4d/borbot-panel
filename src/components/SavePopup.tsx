import { useNavigate, useParams } from "@solidjs/router";
import { Component } from "solid-js";
import { createStore } from "solid-js/store";
import { decryptSavedata } from "../shared/savefile";
import { callAPI } from "../shared/utils";
import styles from "./SavePopup.module.css";

const SavePopup: Component<{ onClose?: () => void, onComplete?: (error?: any) => void }> = (props) => {
    const navigate = useNavigate();
    const params = useParams();

    const [form, setForm] = createStore({
        data: ""
    });

    const updateFormField = (event: Event) => {
        const inputElement = event.currentTarget as HTMLInputElement;
        const fieldName = inputElement.id;

        setForm({
            [fieldName]: inputElement.value
        });
    };

    const onFormSubmit = async (event: Event) => {
        event.preventDefault();

        const save = decryptSavedata(form.data);
        if(!save) {
            console.error("Error when parsing save data.");
            return;
        }

        try {
            const data = await callAPI(`/guilds/${params.id}/setup`, { uid: save.uniqueId, pwd: save.passwordHash }, 'post');
            console.log(data);

            if(props.onComplete) props.onComplete();
        } catch(error) {
            if(props.onComplete) props.onComplete(error); 
        }
    }

    return (
        <>
            <div class={styles.mask}></div>
            <div class={styles.popup}>
                <div class={styles.top}>
                    <h3 class={styles.title}>Add save file</h3>
                    <button 
                        class={styles.close_btn}
                        onClick={() => { if(props.onClose) props.onClose() }
                    }>
                        <span class='material-icons md-bold'>close</span>
                    </button>
                </div>
                <div class={styles.separator}></div>
                <form class={styles.middle} onSubmit={onFormSubmit}>
                    <textarea id='data' class={styles.textarea} placeholder="Paste your save file..." spellcheck={false} onInput={updateFormField}></textarea>
                    <button class={styles.submit_btn} type='submit'>Submit</button>
                </form>
            </div>
        </>
    );
}

export default SavePopup;