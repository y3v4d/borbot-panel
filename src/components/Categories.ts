import { attr, component } from "../shared/decorators";
import { params } from "../shared/router";

@component
export class GuildCategories extends HTMLElement {
    @attr public icon: string;
    @attr public name: string;

    constructor(name?: string, icon?: string) {
        super();

        if(name) this.name = name;
        if(icon) this.icon = icon;
    }

    connectedCallback() {
        this.innerHTML = this.render();
        this.className = "categories";

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
        (<HTMLImageElement> this.querySelector('.categories__icon')).src = this.icon;
        this.querySelector('.categories__name').innerHTML = this.name;
        this.querySelector('.categories__list').innerHTML = `
            <li>
                <a href="/guilds/${params.id}/members" data-link>
                    <button class="categories__list__item">Members</button>
                </a>
            </li>
            <li>
                <a href="/guilds/${params.id}/schedule" data-link>
                    <button class="categories__list__item">Schedule</button>
                </a>
            </li>
        `;
    }

    render() {
        return `
            <img class="categories__icon">
            <p class="categories__name"></p>
            <ul class="categories__list"></ul>
        `;
    }
}