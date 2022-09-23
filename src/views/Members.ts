import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent } from "../shared/decorators";

@defineComponent
export class GuildMembers extends Component {
    static styles = `
        :host {
            display: flex;
            flex-direction: column;
        }

        .header {
            color: #ECEFF4;
            font-size: 20px;

            margin: 0px 16px;
        }

        .header h1 {
            margin: 16px;
        }

        .separator {
            margin: 0px 12px 16px;
            background-color: #D8DEE9;
            height: 2px;
            margin-bottom: 16px;
        }
    `;

    connectedCallback() {
        super.connectedCallback();

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.sidebar').appendChild(new GuildCategories(undefined, undefined, "members"));
        }
    }

    render() {
        return `
            <div class="header">
                <h1>Members</h1>
            </div>
            <div class="separator"></div>
        `;
    }
}