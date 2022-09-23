import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent } from "../shared/decorators";
import { navigateTo, params } from "../shared/router";
import { callAPI, getMaterialIconClass } from "../shared/utils";

@defineComponent
export class GuildSchedule extends Component {
    static styles = `
        ${getMaterialIconClass()}
        
        :host {
            display: flex;
            flex-direction: column;
        }

        .header {
            display: flex;
            align-items: center;

            color: #ECEFF4;
            font-size: 20px;

            margin: 0px 16px;
        }

        .header h1 {
            flex-grow: 1;

            margin: 16px 16px;
        }

        .header button {
            background-color: #434C5E;
            color: #A3BE8C;

            border: none;
            padding: 6px 8px;

            border-radius: 8px;
        }

        .header button:hover {
            cursor: pointer;
            background-color: #4C566A;
        }

        .separator {
            margin: 0px 12px 16px;
            background-color: #D8DEE9;
            height: 2px;
            margin-bottom: 16px;
        }

        .form-schedule__container {
            padding: 0px 16px;
        }

        .list-schedule {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }

        .list-schedule__item {
            display: flex;
            align-items: center;
        }

        .list-schedule__item__index {
            background-color: #4C566A;
            color: #E5E9F0;
            width: 60px;
        
            font-weight: bold;
            text-align: center;
        
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }
        
        .list-schedule__item__select {
            background-color: #434C5E;
            color: #E5E9F0;
        
            flex-grow: 1;
        
            font-size: 14px;
            font-weight: bold;
        
            padding: 16px 16px;
            margin: 8px 0px;
        
            border: none;
        
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
    `;

    async connectedCallback() {
        super.connectedCallback();

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.sidebar').appendChild(new GuildCategories(undefined, undefined, "schedule"));
        }

        const data = await callAPI(`/guilds/${params.id}/schedule`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            navigateTo(`http://localhost:3000/guilds/${params.id}`);

            return;
        }

        this.root.querySelector('.list-schedule').innerHTML = `
            ${data.entries.map(entry => `
                <li class="list-schedule__item">
                    <div class="list-schedule__item__index">
                        <p>${entry.index}</p>
                    </div>
                    <select class="list-schedule__item__select" name="${entry.index}" form="form-schedule">
                        ${
                            data.members.map(member => 
                                `<option class="list-schedule__item__select__option" value=${member.uid} ${member.uid === entry.uid ? "selected" : ""}>${member.name}</option>`
                            ).join(' ')
                        }
                    </select>
                </li>`
            ).join(' ')}
        `;

        this.root.querySelector('#form-schedule').addEventListener('submit', this.onFormSubmit);
    }

    async onFormSubmit(event: Event) {
        event.preventDefault();
            
        let query: any = {};
        (<HTMLFormElement> event.target).querySelectorAll('.list-schedule__item__select').forEach((o: HTMLSelectElement) => {
            query[o.name] = o.options[o.selectedIndex].value;
        });

        const data = await callAPI(`/guilds/${params.id}/schedule`, query, 'post');
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
        } else {
            console.log("Updated schedule.");
        }
    }

    render() {
        return `
            <div class="header">
                <h1>Schedule</h1>
                <button type="submit" form="form-schedule">
                    <i class="material-icons">done</i>
                </button>
            </div>
            <div class="separator"></div>
            <form id="form-schedule" action="/api/guilds/${params.id}/schedule" method="post">
                <div class="form-schedule__container" >
                    <ul class="list-schedule"></ul>
                </div>
            </form>
        `;
    }
}