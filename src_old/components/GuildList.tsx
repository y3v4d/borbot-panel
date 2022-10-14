import { Component } from '../shared/component';
import { attr, defineComponent, watchable } from '../shared/decorators';
import { params } from '../shared/router';
import { callAPI } from '../shared/utils';

import { DOMFactory } from '../shared/factory';

function onDropupClick(event: Event) {
    const dropbtn = this.querySelector('.dropbtn');
    const options = this.querySelector('.options');
    if(options.hasAttribute('hidden')) {
        dropbtn.setAttribute('dropped', '');
        options.removeAttribute('hidden');
    } else {
        dropbtn.removeAttribute('dropped');
        options.setAttribute('hidden', '');
    }
}

@defineComponent
export class GuildList extends Component {
    static styles = `
        .dropup {
            position: relative;
            cursor: pointer;
            margin: 0px 8px;
        }

        .dropbtn {
            user-select: none;
            background-color: #3B4252;
            color: #ECEFF4;

            border-radius: 6px;

            display: flex;
            align-items: center;

            font-weight: bold;
        }

        .dropbtn[dropped] {
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }

        .dropbtn .icon_temp {
            background-color: #434C5E;
            border-radius: 6px;
            width: 36px;
            height: 36px;
            margin: 8px;
        }

        .options {
            position: absolute;

            left: 0;
            right: 0;

            background-color: #434C5E;
            color: #ECEFF4;

            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;

            font-weight: bold;
        }

        .option {
            text-decoration: none;
            color: #ECEFF4;

            display: flex;
            align-items: center;
            border-radius: 6px;
        }

        .option[hidden] {
            display: none;
        }

        .option img, .dropbtn img {
            border-radius: 6px;
            width: 36px;
            height: 36px;
            margin: 8px;
        }

        .option:hover {
            background-color: #81A1C1;
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

        this.items = data.items; // will rerender

        const selected = this.root.querySelector(`a[href="/guilds/${params.id}"]`);
        if(selected) {
            this.selectItem(selected);
        }
    }

    selectItem(target: Element) {
        const options = this.root.querySelector('.options');

        options.querySelectorAll('[hidden]').forEach(o => o.removeAttribute('hidden'));
        target.setAttribute('hidden', '');
        this.root.querySelector('.dropbtn').innerHTML = target.innerHTML;
    }

    onItemClick(event: Event) {
        this.selectItem((event.target as HTMLElement).closest('.option'));
    }

    render() {
        return (
            <div onclick={onDropupClick} class="dropup">
                <div class="dropbtn">
                    <div class="icon_temp"></div>
                </div>
                <div class="options" hidden>
                    {
                        this.items.map(item => 
                            <a href={`/guilds/${item.id}`} class="option" onclick={(event) => this.onItemClick(event)} data-link>
                                <img src={item.icon}></img>
                                <p>{item.name}</p>
                            </a>
                        )
                    }
                </div>
            </div>
        );
    }
}