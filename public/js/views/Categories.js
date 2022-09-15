function Categories(id, name, icon) {
    return makeDOM(`
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
}