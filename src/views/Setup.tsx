import { useParams } from "@solidjs/router";
import { Component } from "solid-js";
import { createStore } from 'solid-js/store';
import { callAPI } from "../shared/utils";

const Setup: Component = () => {
    const params = useParams();

    const [form, setForm] = createStore({
        username: "",
        pwd: ""
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

        try {
            const data = await callAPI(`/guilds/${params.id}/setup`, { uid: form.username, pwd: form.pwd }, 'post');
            console.log(data);
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={onFormSubmit}>
            <label>Username</label>
            <input id='username' type='text' onInput={updateFormField}></input>
            <label>Password</label>
            <input id='pwd' type='password' onInput={updateFormField}></input>
            <button type='submit'>Submit</button>
        </form>
    );
};

export default Setup;