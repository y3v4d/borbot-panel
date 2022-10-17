export function getMaterialIconClass() {
    return `.material-icons { font-family: 'Material Icons'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-smoothing: antialiased; }`;
}

export async function callAPI(path: string, params?: any, method: "get" | "post" = "get", ) {
    const ENDPOINT = 'http://localhost:3010/api';
    //const ENDPOINT = 'http://192.168.8.194:3010/api';

    return new Promise<any>((resolve, reject) => {
        fetch(`${ENDPOINT}${path}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method == 'post' ? JSON.stringify(params) : undefined,
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            resolve(data);
        }).catch(error => reject(error));
    });
}

export function getClassName(id: number) {
    switch(id) {
        case 1: return "Rogue";
        case 2: return "Mage";
        case 3: return "Priest";
        default: return "Unknown";
    }
}