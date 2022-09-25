import { Component } from '../shared/component';
import { attr, defineComponent, watchable } from '../shared/decorators';
import { params } from '../shared/router';
import { callAPI } from '../shared/utils';

import { DOMFactory } from '../shared/factory';

function onItemClicked(event) {
    this.parentElement.querySelectorAll('.icon.selected').forEach(o => {
        o.className = "icon";
    });

    this.querySelector('.icon').className = "icon selected";
}

@defineComponent
export class GuildList extends Component {
    static styles = `
        .temp {
            display: flex;
            flex-direction: column;
        }

        .temp__item {
            background-color: #434C5E;
            border-radius: 50%;
            margin: 0px auto 10px auto;

            width: 64px;
            height: 64px;
        }

        .list {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }

        .item {
            padding-bottom: 10px;
        }
        
        .icon {
            display: block;
            margin-left: auto;
            margin-right: auto;
        
            border-radius: 50%;
        }
        
        .icon.selected {
            border-radius: 20%;
        }
    `;

    @watchable
    private items: any[] = [];

    async connectedCallback() {
        super.connectedCallback();

        const data = await callAPI('/guilds');
        if(data.code != 200) {
            console.error(`Error: ${data.msg}`);
            return;
        }

        this.items = data.items;
    }

    render() {
        if(this.items.length == 0) {
            return (
                <div class="temp">
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                    <div class="temp__item"></div>
                </div>
            );
        } else {
            return (
                <ul class="list">
                    {
                        this.items.map(value => {
                            const className = `icon ${value.id == params.id ? "selected" : ""}`;

                            return (
                                <li class="item" onclick={onItemClicked}>
                                    <a href={`/guilds/${value.id}`} data-link>
                                        <img class={className} src={value.icon}></img>
                                    </a>
                                </li>
                            );
                        })
                    }
                </ul>
            )
        }
    }
}