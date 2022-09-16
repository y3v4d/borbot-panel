function Schedule() {
    document.title = "Borbot | Schedule";

    const container = document.createElement('div');

    fetch(`http://localhost:3000/api/guilds/${guild_id}/schedule`)
    .then(res => res.json())
    .then(data => {
        if(data.error) {
            navigateTo(`http://localhost:3000/guilds/${guild_id}`);
            return;
        }

        const categories = document.querySelector(".categories");
        if(!categories) {
            document.querySelector('.sidebar').appendChild(Categories());
        }

        const ul = makeDOM(`<ul class="list-schedule"></ul>`);
        for(const entry of data.entries) {
            const select = makeDOM(`<select class="list-schedule__item__select" name=${entry.index} form="form-schedule"></select>`);
            
            for(const member of data.members) {
                select.appendChild(makeDOM(`
                    <option class="list-schedule__item__select__option" value=${member.uid} ${member.uid === entry.uid ? "selected" : ""}>${member.name}</option>
                `));
            }

            ul.appendChild(makeDOM(`
                <li class="list-schedule__item">
                    <div class="list-schedule__item__index">
                        <p>${entry.index}</p>
                    </div>
                    ${select.outerHTML}
                </li>
            `));
        }

        const form = makeDOM(`
            <form id="form-schedule" action="/api/guilds/${data.id}/schedule" method="post">
                <div class="form-schedule__container" >
                    ${ul.outerHTML}
                </div>
            </form>
        `);

        form.addEventListener('submit', event => {
            event.preventDefault();
            
            let params = {};
            form.querySelectorAll('.list-schedule__item__select').forEach(o => {
                params[o.name] = o.options[o.selectedIndex].value;
            });

            fetch(`http://localhost:3000/api/guilds/${guild_id}/schedule`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            })
            .then(res => res.json())
            .then(data => {
                if(data.code != 200) {
                    console.error(data.msg);
                } else {
                    console.log("Updated schedule");   
                }
            });
        })

        const schedule = makeDOM(`
            <div class="schedule">
                <div class="schedule__header">
                    <h1>Schedule</h1>
                    <button type="submit" form="form-schedule">
                        <i class="material-icons">done</i>
                    </button>
                </div>
                <div class="schedule__separator"></div>
            </div>
        `);

        schedule.appendChild(form);
        container.replaceWith(schedule);
    });

    return container;
}