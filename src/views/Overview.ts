import { GuildCategories } from "../components/Categories";
import { defineComponent } from "../shared/decorators";
import { params } from "../shared/router";

@defineComponent
export class GuildOverview extends HTMLElement {
    connectedCallback() {
        this.innerHTML = this.render();

        document.querySelector('guild-categories')?.remove();

        fetch(`http://localhost:3010/api/guilds/${params.id}`)
        .then(res => res.json())
        .then(data => {
            if(data.is_setup) {
                this.innerHTML = ``;
                document.querySelector('.sidebar').appendChild(new GuildCategories(data.name, data.icon));
            } else {
                this.innerHTML = `
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