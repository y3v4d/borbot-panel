function parseChild(element: Element, child) {
    if(typeof child == "string") element.appendChild(document.createTextNode(child));
    else if(Array.isArray(child)) {
        child.forEach(o => parseChild(element, o));
    }
    else element.appendChild(child);
}

export function DOMFactory(tag, properties, ...children): Element {
    let element: Element;
    if(typeof tag == "function") {
        element = new tag();
    } else if(typeof tag === "string") {
        element = document.createElement(tag);
    } else {
        throw new Error('wtf');
    }

    if(properties) {
        Object.keys(properties).forEach(key => {
            if(key.startsWith('on')) {
                element.addEventListener(key.slice(2), properties[key]);
            } else element.setAttribute(key, properties[key]);
        });
    }

    if(children) {
        children.map(o => {
            parseChild(element, o);
        });
    }

    return element;
}