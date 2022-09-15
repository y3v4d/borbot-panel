function Schedule() {
    const container = document.createElement('div');
    container.innerHTML = "Loading...";

    fetch("http://localhost:3000/api" + window.location.pathname)
    .then(res => res.json())
    .then(data => {
        const ul = makeDOM(`<ul id="list-schedule"></ul>`);

        for(const entry of data.entries) {
            const select = makeDOM(`<select name=${entry.index} form="form-schedule"></select>`);
            
            for(const member of data.members) {
                select.appendChild(makeDOM(`
                    <option value=${member.uid} ${member.uid === entry.uid ? "selected" : ""}>${member.name}</option>
                `));
            }

            ul.appendChild(makeDOM(`
                <li>
                    ${select.outerHTML}
                </li>
            `));
        }

        container.innerHTML = `
            <h3>Start day: ${data.start}</h3>
            <h3>Next cycle: ${data.next_cycle}</h3>
            <form id="form-schedule" action="/api/guilds/${data.id}/schedule" method="post">
                ${ul.outerHTML}
                <button type="submit">Update Schedule</button>
            </form>
        `;
    });

    return container;
}