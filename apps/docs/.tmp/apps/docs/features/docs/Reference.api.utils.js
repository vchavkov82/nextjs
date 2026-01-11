export function getTypeDisplayFromSchema(schema) {
    if ('allOf' in schema) {
        if (schema.allOf.length === 1) {
            return getTypeDisplayFromSchema(schema.allOf[0]);
        }
        else {
            return {
                displayName: 'all of the following options',
            };
        }
    }
    else if ('oneOf' in schema) {
        if (schema.oneOf.length === 1) {
            return getTypeDisplayFromSchema(schema.oneOf[0]);
        }
        else {
            return {
                displayName: 'one of the following options',
            };
        }
    }
    else if ('anyOf' in schema) {
        if (schema.anyOf.length === 1) {
            return getTypeDisplayFromSchema(schema.anyOf[0]);
        }
        else {
            return {
                displayName: 'any of the following options',
            };
        }
    }
    else if ('enum' in schema) {
        return {
            displayName: 'enum',
        };
    }
    else if (schema.type === 'boolean') {
        return {
            displayName: 'boolean',
        };
    }
    else if (schema.type === 'integer') {
        return {
            displayName: 'integer',
        };
    }
    else if (schema.type === 'number') {
        return {
            displayName: 'number',
        };
    }
    else if (schema.type === 'string') {
        return {
            displayName: 'string',
        };
    }
    else if (schema.type === 'file') {
        return {
            displayName: 'file',
        };
    }
    else if (schema.type === 'array') {
        return {
            displayName: "Array<".concat(getTypeDisplayFromSchema(schema.items).displayName, ">"),
        };
    }
    else if (schema.type === 'object') {
        return {
            displayName: 'object',
        };
    }
    // Default fallback for unhandled schema types
    return {
        displayName: 'unknown',
    };
}
