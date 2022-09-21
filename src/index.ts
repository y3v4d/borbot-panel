import router from "./shared/router";
import { GuildList } from "./components/GuildList";
import { GuildOverview } from "./views/Overview";
import { GuildSchedule } from "./views/Schedule";

document.addEventListener('DOMContentLoaded', () => {
    // static components
    document.querySelector('.guilds').replaceChildren(new GuildList());

    router([
        { path: '/', title: "Borbot", view: null },
        { path: '/guilds/:id', title: "Borbot | Overview", view: GuildOverview },
        { path: '/guilds/:id/schedule', title: "Borbot | Schedule", view: GuildSchedule }
    ]);
});