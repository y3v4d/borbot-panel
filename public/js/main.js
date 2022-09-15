const routes = [
    { path: "/", view: "Viewing Main" },
    { path: "/guilds/:id", view: Overview },
    { path: "/guilds/:id/schedule", view: Schedule },
    { path: "/guilds/:id/members", view: "Viewing Members" }
];

let guild_id = "";

function pathToRegex(path) {
    return new RegExp('^' + path.replace(/:\w+/g, '(\\w+)') + '$');
}

function navigateTo(url) {
    history.pushState({}, "", url);
    
    const path = window.location.pathname;
    const match = routes.find(o => path.match(pathToRegex(o.path)));
    if(!match) {
        console.error("Invalid URL");
    } else {
        const keys = match.path.split('/').slice(1);
        const values = window.location.pathname.split('/').slice(1);

        let params = {};
        for(let i = 0; i < keys.length; ++i) {
            if(keys[i][0] === ":") {
                Object.defineProperty(params, keys[i].slice(1), {
                    value: values[i]
                });
            }
        }

        guild_id = params.id;

        try {
            document.getElementsByClassName('main')[0].replaceChildren(match.view());
        } catch(error) {
            console.error(error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', e => {
        const origin = e.target.closest('a');
        if(origin && origin.matches('[data-link]')) {
            e.preventDefault();

            navigateTo(origin.href);
        }
    });

    navigateTo(window.location.href);

    document.querySelector(".guilds").appendChild(GuildList());
});