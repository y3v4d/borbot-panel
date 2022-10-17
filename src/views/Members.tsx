import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent, watchable } from "../shared/decorators";
import { navigateTo, params } from "../shared/router";
import { callAPI, getClassName, getMaterialIconClass } from "../shared/utils";

import { DOMFactory } from "../shared/factory";
import { getCurrentGuildInfo } from "../shared/global";
import { SpinLoader } from "../components/SpinLoader";

async function onFormSubmit(event: Event) {
    event.preventDefault();

    let query = { data: [] };
    this.querySelectorAll('select').forEach((o: HTMLSelectElement) => {
        query.data.push({ clan_uid: o.name, guild_uid: o.options[o.selectedIndex].value });
    });

    const data = await callAPI(`/guilds/${params.id}/connected`, query, 'post');
    if(data.code != 200) {
        console.error(`Error: ${data.msg}`);
    } else {
        console.log("Updated members.");
    }
}

@defineComponent
export class GuildMembers extends Component {
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

    private clanMembers: any[] = [];
    private guildMembers: any[] = [];

    @watchable
    private connected: any[] = [];

    async connectedCallback() {
        super.connectedCallback();

        const guildInfo = await getCurrentGuildInfo();
        if(!guildInfo.is_setup) {
            navigateTo(`/guilds/${params.id}`);
            return;
        }

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.middle').appendChild(new GuildCategories(guildInfo.name, guildInfo.icon, "members"));
        }
        
        const data = await callAPI(`/guilds/${params.id}/connected`);
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            return;
        }

        this.clanMembers = guildInfo.clanMembers;
        this.guildMembers = guildInfo.guildMembers;
        this.connected = data.members;
    }

    render() {
        if(this.connected.length == 0) {
            return (
                <div class="loading">
                    <SpinLoader/>
                </div>
            );
        } else {
            return (
                <div>
                    <div class="header">
                        <h1>Members</h1>
                        <button type="submit" form="form-members">
                            <i class="material-icons">done</i>
                        </button>
                    </div>
                    <div class="separator"></div>
                    <form id="form-members" onsubmit={onFormSubmit}>
                        <ul class="list">
                            {
                                this.clanMembers.map(co => {
                                    const member = this.connected.find(o => o.clan_uid == co.uid);
                                    const connected_uid = member ? member.guild_uid : null;

                                    return (
                                        <li class="list__item">
                                            <div class="list__item__clanname">
                                                <p>{co.nickname} The {getClassName(co.class)}</p>
                                            </div>
                                            
                                            <select class="list__item__select" name={co.uid} form="form-members">
                                                <option value="none">Noone</option>
                                                {
                                                    this.guildMembers.map(member => {
                                                        const option = (
                                                            <option value={member.id}>
                                                                {member.username}#{member.disc}
                                                            </option>
                                                        );

                                                        if(member.id === connected_uid) option.selected = true;
                                                        return option;
                                                    })
                                                }
                                            </select>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </form>
                </div>
            );
        }
    }
}