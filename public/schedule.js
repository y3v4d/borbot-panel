window.addEventListener('load', () => {
    fetch(`${window.location.href}/get`, {
        method: 'get'
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('start-day').innerHTML = data.start;
        document.getElementById('next-cycle').innerHTML = data.next_cycle;

        const list = document.getElementById('list-schedule');
        for(const entry of data.entries) {
            const li = document.createElement('li');
            const p = document.createElement('p');
            const select = document.createElement('select');

            select.name = entry.index;
            select.form = 'schedule-form';

            for(const member of data.members) {
                const option = document.createElement('option');

                option.value = member.uid;
                option.innerHTML = member.name;
                option.selected = member.uid === entry.uid;

                select.appendChild(option);
            }

            p.innerHTML = entry.index;
            li.appendChild(p);
            li.appendChild(select);
            list.appendChild(li);
        }
    });
});