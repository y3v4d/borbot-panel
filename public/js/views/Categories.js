function Categories(params) {
    let make = (id, icon, name) => makeDOM(`
        <aside class="categories">
            <img class="categories__icon" src=${icon}>
            <p class="categories__name">${name}</p>
            <ul class="categories__list">
                <li>
                    <a href="/guilds/${id}/members" data-link>
                        <button class="categories__list__item">Members</button>
                    </a>
                </li>
                <li>
                    <a href="/guilds/${id}/schedule" data-link>
                        <button class="categories__list__item">Schedule</button>
                    </a>
                </li>
            </ul>
        </aside>
    `);

    if(params) {
        return make(params.id, params.icon, params.name)
    } else {
        const container = makeDOM(`<aside class="categories"></aside>`)

        fetch(`http://localhost:3000/api/guilds/${guild_id}`)
        .then(res => res.json())
        .then(data => {
            container.replaceWith(make(data.id, data.icon, data.name));
        });

        return container;
    }
}