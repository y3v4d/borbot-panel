import { Component } from "../shared/component";
import { attr, defineComponent } from "../shared/decorators";
import { params } from "../shared/router";

@defineComponent
export class GuildCategories extends Component {
    static styles = `
        :host {
            width: 15rem;
            background-color: #434C5E;
        
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        
        .icon {
            display: block;
        
            margin: 16px auto 0px auto;
            width: 80px;
            height: 80px;
        
            border-radius: 50%;
        }
        
        .name {
            text-align: center;
            font-weight: bold;
            font-size: 20px;
            color: #D8DEE9;
        }

        .list {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }
        
        .list__item {
            display: block;
            margin: 0px auto 0px auto;
            width: 80%;
        }
    `;

    @attr public icon: string;
    @attr public name: string;

    constructor(name?: string, icon?: string) {
        super();

        if(name) this.name = name;
        if(icon) this.icon = icon;
    }

    connectedCallback() {
        super.connectedCallback();

        if(!this.icon || !this.name) {
            fetch(`http://localhost:3010/api/guilds/${params.id}`)
            .then(res => res.json())
            .then(data => {
                this.icon = data.icon;
                this.name = data.name;

                this.onDataLoaded();
            });
        } else {
            this.onDataLoaded();
        }
    }

    onDataLoaded() {
        (<HTMLImageElement> this.root.querySelector('.icon')).src = this.icon;
        this.root.querySelector('.name').innerHTML = this.name;
        this.root.querySelector('.list').innerHTML = `
            <li>
                <a href="/guilds/${params.id}/members" data-link>
                    <button class="list__item">Members</button>
                </a>
            </li>
            <li>
                <a href="/guilds/${params.id}/schedule" data-link>
                    <button class="list__item">Schedule</button>
                </a>
            </li>
        `;
    }

    render() {
        return `
            <img class="icon">
            <p class="name"></p>
            <ul class="list"></ul>
        `;
    }
}