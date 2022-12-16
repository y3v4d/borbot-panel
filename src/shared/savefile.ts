import { inflate, inflateRaw } from "pako";

enum SaveType {
    FLASH = 'flash',
    UNITY = 'unity'
}

interface DecodedSaveData {
    passwordHash: string,
    uniqueId: string
}

const HASH_LENGTH = 32;
const encoding_type: { [hash: string]: SaveType } = {
    '7a990d405d2c6fb93aa8fbb0ec1a3b23': SaveType.FLASH,
    '7e8bb5a89f2842ac4af01b3b7e228592': SaveType.UNITY
}

export function decryptSavedata(data: string) {
    if(data.length < HASH_LENGTH) {
        console.warn('Invalid save data passed.');
        return;
    }
    
    const type = encoding_type[data.slice(0, HASH_LENGTH)];
    if(!type) {
        console.warn('Invalid hash type passed.');
        return;
    }

    const decodedData = atob(data.slice(HASH_LENGTH));
    const charData = decodedData.split("").map(o => o.charCodeAt(0));
    const binData = new Uint8Array(charData);

    let decompressed = '{}';
    if(type == SaveType.UNITY) {
        decompressed = inflateRaw(binData, { to: 'string' });
    } else if(type == SaveType.FLASH) {
        decompressed = inflate(binData, { to: 'string' });
    }

    return JSON.parse(decompressed) as DecodedSaveData;
}