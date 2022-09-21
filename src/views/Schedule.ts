import { GuildCategories } from "../components/Categories";
import { attr, component } from "../shared/decorators";
import { navigateTo, params } from "../shared/router";

@component
export class GuildScheduleEntry extends HTMLElement {
    @attr
    public index: string;

    @attr
    public uid: string;

    @attr
    public members: string;

    connectedCallback() {
        this.innerHTML = this.render();

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.sidebar').appendChild(new GuildCategories());
        }
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
}

@component
export class GuildSchedule extends HTMLElement {
    private entries: any[] = [];
    private members: any[] = [];

    connectedCallback() {
        this.innerHTML = this.render();
        this.className = 'schedule';

        fetch(`http://localhost:3010/api/guilds/${params.id}/schedule`)
        .then(res => res.json())
        .then(data => {
            if(data.error) {
                navigateTo(`http://localhost:3000/guilds/${params.id}`);
                return;
            }

            this.entries = data.entries;
            this.members = data.members;

            this.querySelector('.list-schedule').innerHTML = `
                ${this.entries.map(o => 
                    `<guild-schedule-entry index=${o.index} uid=${o.uid} members='${JSON.stringify(this.members)}'></guild-schedule-entry>`
                ).join(' ')}
            `;
        });
        
        this.querySelector('#form-schedule').addEventListener('submit', this.onFormSubmit);
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
            <div class="schedule__header">
                <h1>Schedule</h1>
                <button class="schedule__button" type="submit" form="form-schedule">
                    <i class="material-icons">done</i>
                </button>
            </div>
            <div class="schedule__separator"></div>
            <form id="form-schedule" action="/api/guilds/${params.id}/schedule" method="post">
                <div class="form-schedule__container" >
                    <ul class="list-schedule"></ul>
                </div>
            </form>
        `;
    }
}