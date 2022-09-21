export abstract class Component extends HTMLElement {
    static styles: string = "";

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        
        const style = new CSSStyleSheet();
        style.replaceSync((this.constructor as typeof Component).styles);

        shadowRoot.adoptedStyleSheets = [ style ];

        shadowRoot.innerHTML = this.render();
    }

    render() {
        return ``;
    }

    get root() { return this.shadowRoot; }
}