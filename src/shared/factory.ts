function parseChild(element: Element, child) {
    if(typeof child == "string") element.appendChild(document.createTextNode(child));
    else if(child.length) child.forEach(o => parseChild(element, o));
    else element.appendChild(child);
}

export function DOMFactory(tag, properties, ...children): Element {
    const element = document.createElement(tag);

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