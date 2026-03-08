type Json =
    | { [key: string]: Json }
    | Json[]
    | string
    | number
    | boolean
    | null;

type JsonObj = { [key: string]: Json };

export function cleanGraphQLResponse(obj: Json): Json {
    if (isObject(obj)) {
        if (obj.edges && Array.isArray(obj.edges)) {
            return obj.edges.map((edge) => {
                if (edge && isObject(edge)) {
                    return cleanGraphQLResponse(edge.node);
                }

                return edge;
            });
        }

        if (obj.nodes && Array.isArray(obj.nodes)) {
            return obj.nodes.map((node) => cleanGraphQLResponse(node));
        }

        if (obj.node && isObject(obj.node)) {
            return cleanGraphQLResponse(obj.node);
        }

        return Object.keys(obj).reduce((result: JsonObj, key) => {
            const value = obj[key];
            result[key] = isObject(value) ? cleanGraphQLResponse(value) : obj[key];
            return result;
        }, {} as JsonObj);
    }

    if (Array.isArray(obj)) {
        return obj.map(cleanGraphQLResponse);
    }

    return obj;
}

function isObject(input: Json): input is JsonObj {
    return typeof input === "object" && input !== null && !Array.isArray(input);
}