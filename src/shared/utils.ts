export async function callAPI(path: string, params?: any, method: "get" | "post" = "get", ) {
    const ENDPOINT = 'http://localhost:3010/api';
    //const ENDPOINT = 'http://192.168.8.194:3010/api';

    try {
        const res = await fetch(`${ENDPOINT}${path}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method == 'post' ? JSON.stringify(params) : undefined,
            credentials: 'include'
        });
        
        const json = await res.json();
        if(!res.ok) {
            throw { status: res.status, data: json }
        }

        return json;
    } catch(error) {
        throw error;
    }
}

export function getClassName(id: number) {
    switch(id) {
        case 1: return "Rogue";
        case 2: return "Mage";
        case 3: return "Priest";
        default: return "Unknown";
    }
}