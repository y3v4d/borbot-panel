export function makeDOM(src: string) {
    const temp = document.createElement('div');
    temp.innerHTML = src;

    return temp.children[0];
}

export function getMaterialIconClass() {
    return `.material-icons { font-family: 'Material Icons'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-smoothing: antialiased; }`;
}