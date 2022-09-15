function Overview() {
    const container = makeDOM('<div></div>');
    document.querySelector('.categories')?.remove();

    fetch(`http://localhost:3000/api/guilds/${guild_id}`)
    .then(res => res.json())
    .then(data => {
        if(data.is_setup) {
            container.innerHTML = `Guild setup!`;
            
            document.querySelector('.sidebar').appendChild(Categories(data));
        } else {
            container.innerHTML = `
                <p>You have to setup the guild!</p>
                <form id="form-setup' action="guilds/${data.id}/setup" method="post">
                    <label for="uid">Username: </label>
                    <input type="text" id="uid" name="uid">
                    <label for="pwd">Password Hash: </label>
                    <input type="text" id="pwd" name="pwd">
                    <input type="submit">
                </form>
            `;
        }
    });

    return container;
}