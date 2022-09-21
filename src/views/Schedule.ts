import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent } from "../shared/decorators";
import { navigateTo, params } from "../shared/router";

/*@component
export class GuildScheduleEntry extends HTMLElement {
    @attr
    public index: string;

    @attr
    public uid: string;

    @attr
    public members: string;

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: "open" });

        shadowRoot.innerHTML = this.render();
    }

    render() {
        return `
            <li class="list-schedule__item">
                <div class="list-schedule__item__index">
                    <p>${this.index}</p>
                </div>
                <select class="list-schedule__item__select" name="${this.index}" form="form-schedule">
                    ${
                        JSON.parse(this.members).map(o => 
                            `<option class="list-schedule__item__select__option" value=${o.uid} ${o.uid === this.uid ? "selected" : ""}>${o.name}</option>`
                        ).join(' ')
                    }
                </select>
            </li>
        `;
    }
}*/

@defineComponent
export class GuildSchedule extends Component {
    static styles = `
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

    private entries: any[] = [];
    private members: any[] = [];

    connectedCallback() {
        super.connectedCallback();

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.sidebar').appendChild(new GuildCategories());
        }

        fetch(`http://localhost:3010/api/guilds/${params.id}/schedule`)
        .then(res => res.json())
        .then(data => {
            if(data.error) {
                navigateTo(`http://localhost:3000/guilds/${params.id}`);
                return;
            }

            this.entries = data.entries;
            this.members = data.members;

            this.root.querySelector('.list-schedule').innerHTML = `
                ${this.entries.map(entry => `
                    <li class="list-schedule__item">
                        <div class="list-schedule__item__index">
                            <p>${entry.index}</p>
                        </div>
                        <select class="list-schedule__item__select" name="${entry.index}" form="form-schedule">
                            ${
                                this.members.map(member => 
                                    `<option class="list-schedule__item__select__option" value=${member.uid} ${member.uid === entry.uid ? "selected" : ""}>${member.name}</option>`
                                ).join(' ')
                            }
                        </select>
                    </li>`
                ).join(' ')}
            `;
        });
        
        this.root.querySelector('#form-schedule').addEventListener('submit', this.onFormSubmit);
    }

    onFormSubmit(event: Event) {
        event.preventDefault();
            
        let query = {};
        (<HTMLFormElement> event.target).querySelectorAll('.list-schedule__item__select').forEach((o: HTMLSelectElement) => {
            query[o.name] = o.options[o.selectedIndex].value;
        });

        fetch(`http://localhost:3010/api/guilds/${params.id}/schedule`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        })
        .then(res => res.json())
        .then(data => {
            if(data.code != 200) {
                console.error(data.msg);
            } else {
                console.log("Updated schedule");   
            }
        });
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