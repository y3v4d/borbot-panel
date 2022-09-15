function GuildListEntry(id, imgPath) {
    const li = makeDOM(`
        <li class="guilds-list__item">
            <a href="/guilds/${id}" data-link>
                <img class="guilds-list__icon ${id == guild_id ? "selected" : ""}" src="${imgPath}">
            </a>
        </li>
    `);

    li.addEventListener('click', (e) => {
        li.parentElement.querySelectorAll('.guilds-list__icon.selected').forEach(o => {
            o.className = "guilds-list__icon";
        });

        li.querySelector('.guilds-list__icon').className = "guilds-list__icon selected";
    });

    return li;
}

function GuildList() {
    const CDN_ENDPOINT = 'https://cdn.discordapp.com/icons';
    const UI_ENDPOINT = 'https://ui-avatars.com/api';

    const container = makeDOM(`
        <div class="guilds-list-temp">
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
            <div class="guilds-list-temp__item"></div>
        </div>
    `);

    fetch('http://localhost:3000/api/guilds')
    .then(res => res.json())
    .then(data => {
        const ul = makeDOM(`<ul class="guilds-list"></ul>`);

        for(const entry of data) {
            let imgPath = "";
            if(entry.icon) {
                imgPath = `${CDN_ENDPOINT}/${entry.id}/${entry.icon}.png?size=64`;
            } else {
                const params = {
                    name: entry.name,
                    background: "494d54",
                    uppercase: false,
                    color: "dbdcdd",
                    "font-size": 0.33
                };
                imgPath = `${UI_ENDPOINT}?${new URLSearchParams(params).toString()}`;
            }

            ul.appendChild(GuildListEntry(entry.id, imgPath));
        }

        container.replaceWith(ul);
    });


    return container;
}