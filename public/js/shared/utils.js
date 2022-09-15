
/**
 * @param {string} str - HTML data to parse to element
 */
function makeDOM(str) {
    const temp = document.createElement('div');
    temp.innerHTML = str;

    return temp.children[0];
}