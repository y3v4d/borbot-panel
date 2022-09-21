export function makeDOM(src: string) {
    const temp = document.createElement('div');
    temp.innerHTML = src;

    return temp.children[0];
}