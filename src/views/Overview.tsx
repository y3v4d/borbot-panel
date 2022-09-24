import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent, watchable } from "../shared/decorators";
import { params } from "../shared/router";
import { callAPI } from "../shared/utils";

import { DOMFactory } from "../shared/factory";

@defineComponent
export class GuildOverview extends Component {
    @watchable
    loaded: boolean = false;

    private is_setup: boolean = false;

    async connectedCallback() {
        super.connectedCallback();

        document.querySelector('guild-categories')?.remove();

        const data = await callAPI(`/guilds/${params.id}`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            return;
        }

        if(data.is_setup) {
            this.is_setup = true;
            document.querySelector('.sidebar').appendChild(new GuildCategories(data.name, data.icon));
        } else {
            this.is_setup = false;
        }

        this.loaded = true;
    }

    render() {
        if(!this.loaded) {
            return (
                <p>Loading...</p>
            );
        } else if(this.is_setup) {
            return (
                <div></div>
            );
        } else {
            return (
                <div>
                    <p>You have to setup the guild!</p>
                    <form id='form-setup' action={`guilds/${params.id}/setup`} method="post">
                        <label for="uid">Username: </label>
                        <input type="text" id="uid" name="uid"></input>
                        <label for="pwd">Password Hash: </label>
                        <input type="text" id="pwd" name="pwd"></input>
                        <input type="submit"></input>
                    </form>
                </div>
            );
        }
    }
}