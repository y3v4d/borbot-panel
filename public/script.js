const CDN_ENDPOINT = 'https://cdn.discordapp.com/icons';
const UI_ENDPOINT = 'https://ui-avatars.com/api';

window.onload = () => {
    fetch('http://localhost:3000/guilds', {
        method: 'GET'
    }).then(res => res.json())
    .then(data => {
        const list = document.getElementsByClassName('guilds-list')[0];
        for(const entry of data) {
            const item = document.createElement('li');
            const a = document.createElement('a');
            const img = document.createElement('img');
            item.className = 'guilds-list__item';
            img.className = 'guilds-list__icon';

            if(entry.icon) {
                img.src = `${CDN_ENDPOINT}/${entry.id}/${entry.icon}.png?size=64`;
            } else {
                const params = {
                    name: entry.name,
                    background: "494d54",
                    uppercase: false,
                    color: "dbdcdd",
                    "font-size": 0.33
                };
                img.src = `${UI_ENDPOINT}?${new URLSearchParams(params).toString()}`;
            }

            a.href = `/guild/${entry.id}`;

            a.appendChild(img);
            item.appendChild(a);
            list.appendChild(item);
        }
    });
}