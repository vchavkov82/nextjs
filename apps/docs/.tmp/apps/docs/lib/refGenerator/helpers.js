var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { mapValues, values } from 'lodash-es';
import { flattenSections } from '../helpers';
export function extractTsDocNode(nodeToFind, definition) {
    var nodePath = nodeToFind.split('.');
    var i = 0;
    var previousNode = definition;
    var currentNode = definition;
    while (i < nodePath.length) {
        previousNode = currentNode;
        currentNode = previousNode.children.find(function (x) { return x.name == nodePath[i]; }) || null;
        if (currentNode == null) {
            console.log("Cant find ".concat(nodePath[i], " in ").concat(previousNode.children.map(function (x) { return '\n' + x.name; })));
            break;
        }
        i++;
    }
    return currentNode;
}
export function generateParameters(tsDefinition) {
    var _a, _b;
    var functionDeclaration = null;
    if (tsDefinition.kindString == 'Method') {
        functionDeclaration = tsDefinition;
    }
    else if (tsDefinition.kindString == 'Constructor') {
        functionDeclaration = tsDefinition;
    }
    else
        functionDeclaration = (_a = tsDefinition === null || tsDefinition === void 0 ? void 0 : tsDefinition.type) === null || _a === void 0 ? void 0 : _a.declaration;
    if (!functionDeclaration || !functionDeclaration.signatures)
        return '';
    // Functions can have multiple signatures - select the last one since that
    // tends to be closer to primitive types (citation needed).
    var paramDefinitions = (_b = functionDeclaration.signatures.at(-1)) === null || _b === void 0 ? void 0 : _b.parameters;
    if (!paramDefinitions)
        return '';
    // const paramsComments: TsDoc.CommentTag = tsDefinition.comment?.tags?.filter(x => x.tag == 'param')
    var parameters = paramDefinitions.map(function (x) { return recurseThroughParams(x); }); // old join // .join(`\n`)
    return parameters;
}
function recurseThroughParams(paramDefinition) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var param = __assign({}, paramDefinition);
    var labelParams = generateLabelParam(param);
    var children;
    if (((_a = param.type) === null || _a === void 0 ? void 0 : _a.type) === 'literal') {
        // skip: literal types have no children
    }
    else if (((_b = param.type) === null || _b === void 0 ? void 0 : _b.type) === 'intrinsic') {
        // primitive types
        if (!['string', 'number', 'boolean', 'object', 'unknown'].includes((_c = param.type) === null || _c === void 0 ? void 0 : _c.name)) {
            // skip for now
            //throw new Error('unexpected intrinsic type')
        }
    }
    else if ((_d = param.type) === null || _d === void 0 ? void 0 : _d.dereferenced) {
        var dereferenced = param.type.dereferenced;
        if (dereferenced.children) {
            children = dereferenced.children;
        }
        else if ((_f = (_e = dereferenced.type) === null || _e === void 0 ? void 0 : _e.declaration) === null || _f === void 0 ? void 0 : _f.children) {
            children = dereferenced.type.declaration.children;
        }
        else if (((_g = dereferenced.type) === null || _g === void 0 ? void 0 : _g.type) === 'query') {
            // skip: ignore types created from `typeof` for now, like `type Fetch = typeof fetch`
        }
        else if (((_h = dereferenced.type) === null || _h === void 0 ? void 0 : _h.type) === 'union') {
            // skip: we don't want to show unions as nested parameters
        }
        else if (Object.keys(dereferenced).length === 0) {
            // skip: {} have no children
        }
        else {
            throw new Error('unexpected case for dereferenced param type');
        }
    }
    else if (((_j = param.type) === null || _j === void 0 ? void 0 : _j.type) === 'reflection') {
        var declaration = param.type.declaration;
        if (!declaration) {
            throw new Error('reflection must have a declaration');
        }
        if (declaration.children) {
            children = declaration.children;
        }
        else if (declaration.signatures) {
            // skip: functions have no children
        }
        else if (declaration.name === '__type') {
            // skip: mostly inlined object type
        }
        else {
            throw new Error('unexpected case for reflection param type');
        }
    }
    else if (((_k = param.type) === null || _k === void 0 ? void 0 : _k.type) === 'indexedAccess') {
        // skip: too complex, e.g. PromisifyMethods<Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>>
    }
    else if (((_l = param.type) === null || _l === void 0 ? void 0 : _l.type) === 'reference') {
        // skip: mostly unexported types
    }
    else if (((_m = param.type) === null || _m === void 0 ? void 0 : _m.type) === 'union') {
        // skip: we don't want to show unions as nested parameters
    }
    else if (((_o = param.type) === null || _o === void 0 ? void 0 : _o.type) === 'array') {
        // skip: no use for it for now
    }
    else {
        // skip: no use for now
        //throw new Error(`unexpected param type`)
    }
    if (children) {
        var properties = children
            .sort(function (a, b) { var _a; return (_a = a.name) === null || _a === void 0 ? void 0 : _a.localeCompare(b.name); }) // first alphabetical
            .sort(function (a, b) { var _a; return (((_a = a.flags) === null || _a === void 0 ? void 0 : _a.isOptional) ? 1 : -1); }) // required params first
            .map(function (x) { return recurseThroughParams(x); });
        labelParams.subContent = properties;
    }
    return labelParams;
}
// const isDereferenced = (paramDefinition: TsDoc.TypeDefinition) => {
//   // @ts-ignore
//   return paramDefinition.type?.type == 'reference' && paramDefinition.type?.dereferenced?.id
// }
function generateLabelParam(param) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var labelParams = {};
    if (((_a = param.type) === null || _a === void 0 ? void 0 : _a.type) === 'intrinsic' && ((_b = param.type) === null || _b === void 0 ? void 0 : _b.name) === 'unknown') {
        labelParams = {
            name: (_c = param.name) !== null && _c !== void 0 ? _c : param.value,
            isOptional: Boolean((_d = param.flags) === null || _d === void 0 ? void 0 : _d.isOptional) || 'defaultValue' in param,
            type: 'any',
            description: param.comment ? tsDocCommentToMdComment(param.comment) : null,
        };
    }
    else if ((_f = (_e = param.type) === null || _e === void 0 ? void 0 : _e.declaration) === null || _f === void 0 ? void 0 : _f.signatures) {
        labelParams = {
            name: (_g = param.name) !== null && _g !== void 0 ? _g : param.value,
            isOptional: Boolean((_h = param.flags) === null || _h === void 0 ? void 0 : _h.isOptional) || 'defaultValue' in param,
            type: 'function',
            description: param.comment ? tsDocCommentToMdComment(param.comment) : null,
        };
    }
    else if (((_j = param.type) === null || _j === void 0 ? void 0 : _j.type) === 'literal') {
        labelParams = {
            name: (_k = param.name) !== null && _k !== void 0 ? _k : param.value,
            isOptional: Boolean((_l = param.flags) === null || _l === void 0 ? void 0 : _l.isOptional) || 'defaultValue' in param,
            type: typeof param.type.value === 'string' ? "\"".concat(param.type.value, "\"") : "".concat(param.type.value),
            description: param.comment ? tsDocCommentToMdComment(param.comment) : null,
        };
    }
    else {
        labelParams = {
            name: (_m = param.name) !== null && _m !== void 0 ? _m : extractParamTypeAsString(param),
            isOptional: Boolean((_o = param.flags) === null || _o === void 0 ? void 0 : _o.isOptional) || 'defaultValue' in param,
            type: extractParamTypeAsString(param),
            description: param.comment ? tsDocCommentToMdComment(param.comment) : null,
        };
    }
    return labelParams;
}
function extractParamTypeAsString(paramDefinition) {
    var _a, _b, _c;
    if ((_a = paramDefinition.type) === null || _a === void 0 ? void 0 : _a.name) {
        // return `<code>${paramDefinition.type.name}</code>` // old
        return paramDefinition.type.name;
    }
    else if (((_b = paramDefinition.type) === null || _b === void 0 ? void 0 : _b.type) === 'union') {
        // only do this for literal/primitive types - for complex objects we just return 'object'
        if (paramDefinition.type.types.every(function (_a) {
            var type = _a.type;
            return ['literal', 'intrinsic'].includes(type);
        })) {
            return paramDefinition.type.types
                .map(function (x) {
                if (x.type === 'literal') {
                    if (typeof x.value === 'string') {
                        return "\"".concat(x.value, "\"");
                    }
                    return "".concat(x.value);
                }
                else if (x.type === 'intrinsic') {
                    if (x.name === 'unknown') {
                        return 'any';
                    }
                    return x.name;
                }
            })
                .join(' | ');
        }
    }
    else if (((_c = paramDefinition.type) === null || _c === void 0 ? void 0 : _c.type) === 'array') {
        var elementType = paramDefinition.type.elementType;
        if (elementType.type === 'intrinsic') {
            if (elementType.name === 'unknown') {
                return 'any[]';
            }
            return "".concat(elementType.name, "[]");
        }
        return 'object[]';
    }
    return 'object'; // old '<code>object</code>'
}
var tsDocCommentToMdComment = function (commentObject) {
    return "\n".concat((commentObject === null || commentObject === void 0 ? void 0 : commentObject.shortText) || '', "\n\n").concat((commentObject === null || commentObject === void 0 ? void 0 : commentObject.text) || '', "\n\n").trim();
};
export function gen_v3(spec, dest, _a) {
    var apiUrl = _a.apiUrl, type = _a.type;
    var specLayout = spec.tags || [];
    var operations = [];
    Object.entries(spec.paths).forEach(function (_a) {
        var key = _a[0], val = _a[1];
        var fullPath = "".concat(apiUrl).concat(key);
        toArrayWithKey(val, 'operation').forEach(function (o) {
            var operation = o;
            var operationId = type === 'mgmt-api' && operation.operationId && isValidSlug(operation.operationId)
                ? operation.operationId
                : slugify(operation.summary);
            var enriched = __assign(__assign({}, operation), { path: key, fullPath: fullPath, operationId: operationId, responseList: toArrayWithKey(operation.responses, 'responseCode') || [] });
            // @ts-expect-error // missing 'responses', see OpenAPIV3.OperationObject.responses
            operations.push(enriched);
        });
    });
    var sections = specLayout.map(function (section) {
        return __assign(__assign({}, section), { title: toTitle(section.name), id: slugify(section.name), operations: operations.filter(function (operation) { var _a; return (_a = operation.tags) === null || _a === void 0 ? void 0 : _a.includes(section.name); }) });
    });
    var content = {
        info: spec.info,
        sections: sections,
        operations: operations,
    };
    return content;
}
var slugify = function (text) {
    if (!text)
        return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/[. )(]/g, '-') // Replace spaces and brackets -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};
function isValidSlug(slug) {
    var slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}
// Uppercase the first letter of a string
var toTitle = function (text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
};
/**
 * Convert Object to Array of values
 */
export var toArrayWithKey = function (obj, keyAs) {
    return values(mapValues(obj, function (value, key) {
        value[keyAs] = key;
        return value;
    }));
};
/**
 * Get a list of common section IDs that are available in this spec
 */
export function getAvailableSectionIds(sections, spec) {
    // Filter parent sections first
    var specIds = spec.functions.map(function (_a) {
        var id = _a.id;
        return id;
    });
    var newShape = flattenSections(sections).filter(function (section) {
        if (specIds.includes(section.id)) {
            return section;
        }
    });
    var final = newShape.map(function (func) {
        return func.id;
    });
    return final;
}
