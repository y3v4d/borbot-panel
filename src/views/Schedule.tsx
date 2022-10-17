import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent, watchable } from "../shared/decorators";
import { navigateTo, params } from "../shared/router";
import { callAPI, getMaterialIconClass } from "../shared/utils";

import { DOMFactory } from "../shared/factory";
import { getCurrentGuildInfo } from "../shared/global";
import { SpinLoader } from "../components/SpinLoader";

async function onFormSubmit(event) {
    event.preventDefault();
            
    let query: any = {};
    this.querySelectorAll('.list-schedule__item__select').forEach((o: HTMLSelectElement) => {
        query[o.name] = o.options[o.selectedIndex].value;
    });

    const data = await callAPI(`/guilds/${params.id}/schedule`, query, 'post');
    if(data.code != 200) {
        console.error(`Error: ${data.msg}`);
    } else {
        console.log("Updated schedule.");
    }
}

@defineComponent
export class GuildSchedule extends Component {
    static styles = `
        ${getMaterialIconClass()}
        
        :host {
            flex-grow: 1;

            display: flex;
            flex-direction: column;
        }

        .loading {
            flex-grow: 1;

            display: flex;
            align-items: center;
            justify-content: center;
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

    
    private members: any[] = [];

    @watchable
    private entries: any[] = [];

    async connectedCallback() {
        super.connectedCallback();

        const guildInfo = await getCurrentGuildInfo();
        if(!guildInfo.is_setup) {
            navigateTo(`/guilds/${params.id}`)
            return;
        }

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.middle').appendChild(new GuildCategories(guildInfo.name, guildInfo.icon, "schedule"));
        }

        const data = await callAPI(`/guilds/${params.id}/schedule`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            navigateTo(`/guilds/${params.id}`);

            return;
        }

        this.members = guildInfo.guildMembers;
        //this.entries = data.entries;
        let items: any[] = [];
        let current_i = 0;
        for(let i = 0; i < 10; ++i) {
            if(data.entries[current_i].index == i + 1) {
                items.push(data.entries[current_i++]);
            } else {
                items.push({ uid: '', index: (i + 1).toString() })
            }
        }
        this.entries = items;
    }

    render() {
        if(this.entries.length == 0) {
            return (
                <div class="loading">
                    <SpinLoader/>
                </div>
            )
        } else {
            return (
                <div>
                    <div class="header">
                        <h1>Schedule</h1>
                        <button type="submit" form="form-schedule">
                            <i class="material-icons">done</i>
                        </button>
                    </div>
                    <div class="separator"></div>
                    <form id="form-schedule" action={`/api/guilds/${params.id}/schedule`} onsubmit={onFormSubmit}>
                        <div class="form-schedule__container">
                            <ul class="list-schedule">
                                {
                                    this.entries.map(entry =>
                                        <li class="list-schedule__item">
                                            <div class="list-schedule__item__index">
                                                <p>{entry.index.toString()}</p>
                                            </div>
                                            <select class="list-schedule__item__select" name={entry.index} form="form-schedule">
                                                {
                                                    this.members.map(member => {
                                                        const option = (
                                                            <option class="list-schedule__item__select__option" value={member.id}>
                                                                {member.username}#{member.disc}
                                                            </option>
                                                        );

                                                        if(member.id == entry.uid) option.selected = true;

                                                        return option;
                                                    })
                                                }
                                            </select>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    </form>
                </div>
            );
        }
    }
}