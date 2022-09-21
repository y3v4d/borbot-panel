import { attr, component, watchable } from '../shared/decorators';
import { params } from '../shared/router';

@component
export class GuildListEntry extends HTMLElement {
    @attr
    private guild_id: string;

    @attr
    private icon: string;

    connectedCallback() {
        this.innerHTML = this.render();

        this.addEventListener('click', (event) => {
            this.parentElement.querySelectorAll('.guilds-list__icon.selected').forEach(o => {
                o.className = "guilds-list__icon";
            });

            this.querySelector('.guilds-list__icon').className = "guilds-list__icon selected";
        });
    }

    render() {
        return `
            <li class="guilds-list__item">
                <a href="/guilds/${this.guild_id}" data-link>
                    <img class="guilds-list__icon ${this.guild_id == params.id ? "selected" : ""}" src="${this.icon}">
                </a>
            </li>
        `;
    }
}

@component
export class GuildList extends HTMLElement {
    @watchable
    private loaded: boolean = false;

    public entries: { id: string, icon: string }[] = [];

    connectedCallback() {
        this.innerHTML = this.render();

        if(!this.loaded) {
            fetch('http://localhost:3010/api/guilds')
            .then(res => res.json())
            .then(data => {
                if(data.code != 200) {
                    console.error("Couldn't fetch");
                    return;
                }

                for(const entry of data.items) {
                    this.entries.push({ id: entry.id, icon: entry.icon });
                }

                this.innerHTML = `
                    <ul class="guilds-list">
                        ${
                            this.entries.map(value => {
                                return `<guild-list-entry guild_id=${value.id} icon=${value.icon}></guild-list-entry>`
                            }).join(' ')
                        }
                    </ul>
                `;
            });
        }
    }

    render() {
        return `
            <div class="guilds-list-temp">
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
                <div class="guilds-list-temp__item"></div>
            </div>
        `;
    }
}