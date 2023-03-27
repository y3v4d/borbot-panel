export function getCookie(cookieName: string) {
    const name = cookieName + '=';
    const pairs = document.cookie.split(';');
    for(let i = 0; i < pairs.length; ++i) {
        const trimmed = pairs[i].trim();
        if(trimmed.indexOf(name) == 0) {
            return trimmed.substring(name.length);
        }
    }

    return "";
}

export async function callAPI(path: string, params?: any, method: "get" | "post" | "delete" = "get") {
    const ENDPOINT = import.meta.env.VITE_API_ADDRESS;

    try {
        const res = await fetch(`${ENDPOINT}${path}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getCookie('token')
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