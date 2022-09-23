import { Component } from "../shared/component";
import { attr, defineComponent } from "../shared/decorators";
import { params } from "../shared/router";
import { callAPI, getMaterialIconClass } from "../shared/utils";

@defineComponent
export class GuildCategories extends Component {
    static styles = `
        ${getMaterialIconClass()}
        
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
            display: flex;
            height: 40px;

            margin: 0px auto 0px auto;
            width: 90%;

            background-color: #3B4252;
            color: #D8DEE9;

            text-decoration: none;

            border-radius: 8px;

            justify-content: center;
            align-items: center;

            margin-bottom: 10px;
        }

        .list__item.selected {
            background-color: #8FBCBB;
            color: #2E3440;
        }

        .list__item i {
            padding-left: 14px;
        }

        .list__item p {
            flex-grow: 1;
            text-align: center;

            padding-right: 14px;
        }
    `;

    @attr public icon: string;
    @attr public name: string;

    private selectedCategory: string | null = null;

    constructor(name?: string, icon?: string, category?: string) {
        super();

        if(name) this.name = name;
        if(icon) this.icon = icon;
        if(category) this.selectedCategory = category;
    }

    async connectedCallback() {
        super.connectedCallback();

        if(!this.icon || !this.name) {
            const data = await callAPI(`/guilds/${params.id}`);
            if(data.code != 200) {
                console.error(`Error: ${data.msg}`);
                return;
            }

            this.icon = data.icon;
            this.name = data.name;
        }
        
        this.onDataLoaded();
    }

    selectCategory(category: string) {
        const list = this.root.querySelector('.list');
        list.querySelectorAll('.list__item.selected').forEach(a => {
            a.className = 'list__item';
        });

        list.querySelector(`#${category}`).className = 'list__item selected';
    }

    onDataLoaded() {
        (<HTMLImageElement> this.root.querySelector('.icon')).src = this.icon;
        this.root.querySelector('.name').innerHTML = this.name;
        this.root.querySelector('.list').innerHTML = `
            <li>
                <a id="home" href="/guilds/${params.id}/home" class="list__item" data-link>
                    <i class="material-icons">home</i>
                    <p>Overview</p>
                </a>
            </li>
            <li>
                <a id="members" href="/guilds/${params.id}/members" class="list__item" data-link>
                    <i class="material-icons">group</i>
                    <p>Members</p>
                </a>
            </li>
            <li>
                <a id="schedule" href="/guilds/${params.id}/schedule" class="list__item" data-link>
                    <i class="material-icons">event</i>
                    <p>Schedule</p>
                </a>
            </li>
        `;

        this.root.querySelectorAll('.list__item').forEach(a => {
            a.addEventListener('click', () => {
                this.selectCategory(a.id);
            });
        });

        if(this.selectedCategory) this.selectCategory(this.selectedCategory);
    }

    render() {
        return `
            <img class="icon">
            <p class="name"></p>
            <ul class="list"></ul>
        `;
    }
}