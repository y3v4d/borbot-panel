import { useNavigate, useParams } from "@solidjs/router";
import { Component } from "solid-js";
import { createStore } from 'solid-js/store';
import { decryptSavedata } from "../shared/savefile";
import { callAPI } from "../shared/utils";

const Setup: Component = () => {
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
            navigate(`/dashboard/${params.id}`);
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={onFormSubmit}>
            <textarea id='data' onInput={updateFormField}></textarea>
            <button type='submit'>Submit</button>
        </form>
    );
};

export default Setup;