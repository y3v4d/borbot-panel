import { DOMFactory } from "./factory";

export abstract class Component extends HTMLElement {
    static styles: string = "";
    private _isConnected: boolean = false;

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        
        const style = new CSSStyleSheet();
        style.replaceSync((this.constructor as typeof Component).styles);

        shadowRoot.adoptedStyleSheets = [ style ];

        const content = this.render();
        if(typeof content === "string") shadowRoot.innerHTML = content;
        else shadowRoot.replaceChildren(content);

        this._isConnected = true;
    }

    render(): HTMLElement | string {
        return ``;
    }

    get root() { return this.shadowRoot; }
    get isConnected() { return this._isConnected; }
}