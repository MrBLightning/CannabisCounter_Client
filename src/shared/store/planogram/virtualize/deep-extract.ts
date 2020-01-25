export function deepExtractKey(obj: any, key: string): any[] {
    switch (typeof obj) {
        case "string":
        case "number":
        case "boolean":
            return [];
    }
    let extracted: any[] = [];
    for (const _k in obj) {
        if (_k === key)
            extracted.push(obj[_k]);
        else
            extracted = extracted.concat(deepExtractKey(obj[_k], key));
    }
    return extracted;
}

export function padNumber(num: number, len: number) {
    let str = num + "";
    while (str.length < len)
        str = "0" + str;
    return str;
}