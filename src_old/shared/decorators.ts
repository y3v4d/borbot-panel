export function watchable(target: any, key: string) {
    const getter = function() {
        return this['_' + key];
    }
    
    const setter = function(value: any) {
        this['_' + key] = value;
        if(this.isConnected) {
            const content = this.render();
            if(typeof content === "string") this.root.innerHTML = content;
            else this.root.replaceChildren(content);
        }
    }

    if(delete target[key]) {
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
}

export function attr(target: any, key: string) {
    const getter = function() {
        return this.getAttribute(key);
    }

    const setter = function(value: string) {
        this.setAttribute(key, value);
        if(this.isConnected) {
            const content = this.render();
            if(typeof content === "string") this.root.innerHTML = content;
            else this.root.replaceChildren(content);
        }
    }

    if(delete target[key]) {
        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: false
        })
    }
}

export function defineComponent(constructor: Function) {
    const words = Array.from(constructor.name.match(/[A-Z]([^A-Z]*)/g));
    const name = words.map(o => o.toLowerCase()).join('-');

    window.customElements.define(name, constructor as any);
}