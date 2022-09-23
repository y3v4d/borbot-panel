import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent } from "../shared/decorators";
import { params } from "../shared/router";
import { callAPI, getMaterialIconClass } from "../shared/utils";

function getClassName(id: number) {
    switch(id) {
        case 1: return "Rogue";
        case 2: return "Mage";
        case 3: return "Priest";
        default: return "Unknown";
    }
}

@defineComponent
export class GuildMembers extends Component {
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
            margin: 16px;
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

        .list {
            list-style-type: none;
            margin: 0;
            padding: 0 16px;
        }

        .list__item {
            display: flex;
            align-items: center;

            margin-bottom: 16px;
        }

        .list__item__clanname {
            background-color: #4C566A;
            color: #E5E9F0;

            width: 200px;

            font-weight: bold;
            text-align: center;
            
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }

        .list__item select {
            background-color: #434C5E;
            color: #E5E9F0;
        
            flex-grow: 1;
        
            font-size: 14px;
            font-weight: bold;
        
            padding: 16px 16px;
        
            border: none;
        
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
    `;

    async connectedCallback() {
        super.connectedCallback();

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.sidebar').appendChild(new GuildCategories(undefined, undefined, "members"));
        }

        let data = await callAPI(`/guilds/${params.id}/guildMembers`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            return;
        }

        const guildMembers = data.members;

        data = await callAPI(`/guilds/${params.id}/clanMembers`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            return;
        }

        const clanMembers = data.members.sort((self, other) => {
            return self.nickname.toLocaleLowerCase().charCodeAt(0) - other.nickname.toLocaleLowerCase().charCodeAt(0);
        })

        data = await callAPI(`/guilds/${params.id}/connected`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            return;
        }

        const connected = data.members;
        this.root.querySelector('.list').innerHTML = `
            ${
                clanMembers.map(co => {
                    const member = connected.find(o => o.clan_uid == co.uid);
                    const connected_uid = member ? member.guild_uid : null;

                    return `
                        <li class="list__item">
                            <div class="list__item__clanname">
                                <p>${co.nickname} The ${getClassName(co.class)}</p>
                            </div>
                            
                            <select class="list__item__select" name="${co.uid}" form="form-members">
                                <option value="none">Noone</option>
                                ${
                                    guildMembers.map(member => {
                                        return `
                                            <option value="${member.id}" ${member.id === connected_uid ? "selected" : "" }>
                                                ${member.username}#${member.disc}
                                            </option>
                                        `;
                                    })
                                }
                            </select>
                        </li>
                    `;
                }).join(' ')
            }
        `;

        this.root.querySelector('#form-members').addEventListener('submit', this.onFormSubmit);
    }

    async onFormSubmit(event: Event) {
        event.preventDefault();

        let query = { data: [] };
        (<HTMLFormElement> event.target).querySelectorAll('.list__item__select').forEach((o: HTMLSelectElement) => {
            query.data.push({ clan_uid: o.name, guild_uid: o.options[o.selectedIndex].value });
        });

        const data = await callAPI(`/guilds/${params.id}/connected`, query, 'post');
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
        } else {
            console.log("Updated members.");
        }
    }

    render() {
        return `
            <div class="header">
                <h1>Members</h1>
                <button type="submit" form="form-members">
                    <i class="material-icons">done</i>
                </button>
            </div>
            <div class="separator"></div>
            <form id="form-members" action="/api/guilds/${params.id}/connected" method="post">
                <ul class="list"></ul>
            </form>
        `;
    }
}