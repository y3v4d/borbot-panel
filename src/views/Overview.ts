import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent } from "../shared/decorators";
import { params } from "../shared/router";

@defineComponent
export class GuildOverview extends Component {
    connectedCallback() {
        super.connectedCallback();

        document.querySelector('guild-categories')?.remove();

        fetch(`http://192.168.8.194:3010/api/guilds/${params.id}`)
        .then(res => res.json())
        .then(data => {
            if(data.is_setup) {
                this.root.innerHTML = ``;
                document.querySelector('.sidebar').appendChild(new GuildCategories(data.name, data.icon));
            } else {
                this.root.innerHTML = `
                    <p>You have to setup the guild!</p>
                    <form id="form-setup' action="guilds/${params.id}/setup" method="post">
                        <label for="uid">Username: </label>
                        <input type="text" id="uid" name="uid">
                        <label for="pwd">Password Hash: </label>
                        <input type="text" id="pwd" name="pwd">
                        <input type="submit">
                    </form>
                `;
            }
        });
    }

    render() {
        return `<p>Loading...</p>`;
    }
}