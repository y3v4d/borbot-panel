import { Component } from "../shared/component";
import { attr, defineComponent } from "../shared/decorators";
import { params } from "../shared/router";
import { callAPI, getMaterialIconClass } from "../shared/utils";

import { DOMFactory } from "../shared/factory";

function onCategoryItemClicked(event: Event) {
    this.parentElement.querySelectorAll('.item.selected').forEach(a => {
        a.className = 'item'
    });

    this.querySelector('.item').className = "item selected";
}

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

        .icon__temp {

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
        
        .item {
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

        .item.selected {
            background-color: #8FBCBB;
            color: #2E3440;
        }

        .item i {
            padding-left: 14px;
        }

        .item p {
            flex-grow: 1;
            text-align: center;

            padding-right: 14px;
        }
    `;

    @attr public icon: string = "";
    @attr public name: string = "";

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

            this.icon = data.icon.replace("size=64", "size=80");
            this.name = data.name;
        }
        
        if(this.selectedCategory) this.selectCategory(this.selectedCategory);
    }

    selectCategory(name?: string) {
        const item = name !== undefined ? this.root.querySelector(`#${name}`) : this;

        item.parentElement.querySelectorAll('.item.selected').forEach(a => {
            a.className = 'item'
        });

        item.querySelector('.item').className = "item selected";
    }

    render() {
        return (
            <div>
                <img class="icon" src={this.icon}></img>
                <p class="name">{this.name}</p>
                <ul class="list">
                    <li id="home" onclick={onCategoryItemClicked}>
                        <a href={`/guilds/${params.id}`} class="item" data-link>
                            <i class="material-icons">home</i>
                            <p>Overview</p>
                        </a>
                    </li>
                    <li id="members" onclick={onCategoryItemClicked}>
                        <a href={`/guilds/${params.id}/members`} class="item" data-link>
                            <i class="material-icons">group</i>
                            <p>Members</p>
                        </a>
                    </li>
                    <li id="schedule" onclick={onCategoryItemClicked}>
                        <a href={`/guilds/${params.id}/schedule`} class="item" data-link>
                            <i class="material-icons">event</i>
                            <p>Schedule</p>
                        </a>
                    </li>
                </ul>
            </div>  
        );
    }
}