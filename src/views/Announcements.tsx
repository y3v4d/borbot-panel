import { GuildCategories } from "../components/Categories";
import { Component } from "../shared/component";
import { defineComponent, watchable } from "../shared/decorators";

import { DOMFactory } from "../shared/factory";
import { getCurrentGuildInfo } from "../shared/global";
import { navigateTo, params } from "../shared/router";
import { callAPI } from "../shared/utils";

@defineComponent
export class GuildAnnouncements extends Component {
    static styles = `
        .header {
            display: flex;
            align-items: center;

            color: #ECEFF4;
            font-size: 20px;

            margin: 0px 16px;
        }

        .separator {
            margin: 0px 12px 16px;
            background-color: #D8DEE9;
            height: 2px;
            margin-bottom: 16px;
        }

        .option {
            padding: 0px 16px;
            display: flex;
        }

        .option p {
            color: #ECEFF4;
            flex-grow: 1;
            font-size: 20px;
            font-weight: bold;
            margin: 4px;
        }

        .option select {
            border-radius: 8px;
            border: 0;
            background-color: #434C5E;
            color: #E5E9F0;
            padding-left: 8px;
            padding-right: 8px;
        }
    `;

    @watchable
    private channels: any[] = [];

    async connectedCallback() {
        super.connectedCallback();

        const guildInfo = await getCurrentGuildInfo();
        if(!guildInfo.is_setup) {
            navigateTo(`/guilds/${params.id}`)
            return;
        }

        if(!document.querySelector('guild-categories')) {
            document.querySelector('.sidebar').appendChild(new GuildCategories(guildInfo.name, guildInfo.icon, "announcements"));
        }

        const data = await callAPI(`/guilds/${params.id}/channels`);
        console.log(data);

        this.channels = data.channels;
    }
    
    render() {
        return (
            <div>
                <div class="header">
                    <h1>Announcements</h1>
                </div>
                <div class="separator"></div>
                <div class="options">
                    <div class="option">
                        <p>Announcement channel</p>
                        <select>
                            <option value='none'>None</option>
                            {
                                this.channels.map(channel => 
                                    <option value={channel.id}>#{channel.name}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
            </div>
        )
    }
}