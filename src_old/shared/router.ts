interface Route {
    path: string,
    title?: string,
    view: new (...args) => HTMLElement | null;
}

let routes: Route[] = [];

function pathToRegex(path: string) {
    return new RegExp('^' + path.replace(/:\w+/g, '(\\w+)') + '$');
}

export let params: any = {};
export function navigateTo(url: string) {
    history.pushState({}, "", url);
    
    const path = window.location.pathname;
    const match = routes.find(o => path.match(pathToRegex(o.path)));
    if(!match) {
        console.error("Invalid URL");
    } else {
        const keys = match.path.split('/').slice(1);
        const values = window.location.pathname.split('/').slice(1);

        let query: any = {};
        for(let i = 0; i < keys.length; ++i) {
            if(keys[i][0] === ":") {
                query[keys[i].slice(1)] = values[i];
            }
        }

        params = query;

        try {
            if(match.view) {
                document.querySelector('.container').replaceChildren(new match.view());
            } else {
                document.querySelector('.container').innerHTML = '';
            }
            
            if(match.title) document.title = match.title;
        } catch(error) {
            console.error(error);
        }
    }
}

export default function router(params: Route[]) {
    routes = params;

    document.addEventListener('click', event => {
        const origin = (<HTMLElement> event.composedPath()[0]).closest('a');
        if(origin && origin.matches('[data-link]')) {
            event.preventDefault();

            navigateTo(origin.href);
        }
    });

    let pathname = window.location.pathname;
    if(pathname.length == 0) pathname = '/';

    navigateTo(pathname);
}