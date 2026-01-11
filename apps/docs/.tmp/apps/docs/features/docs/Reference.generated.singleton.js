var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
var typeSpec;
function _typeSpecSingleton() {
    return __awaiter(this, void 0, void 0, function () {
        var rawJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!typeSpec) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', './generated/typeSpec.json'), 'utf-8')];
                case 1:
                    rawJson = _a.sent();
                    typeSpec = JSON.parse(rawJson, function (key, value) {
                        if (key === 'methods') {
                            return new Map(Object.entries(value));
                        }
                        else {
                            return value;
                        }
                    });
                    _a.label = 2;
                case 2: return [2 /*return*/, typeSpec];
            }
        });
    });
}
function normalizeRefPath(path) {
    return path.replace(/\.index(?=\.|$)/g, '').replace(/\.+/g, '.');
}
export function getTypeSpec(ref) {
    return __awaiter(this, void 0, void 0, function () {
        var modules, normalizedRef, delimiter, refMod, mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _typeSpecSingleton()];
                case 1:
                    modules = _a.sent();
                    normalizedRef = normalizeRefPath(ref);
                    delimiter = normalizedRef.indexOf('.');
                    refMod = normalizedRef.substring(0, delimiter);
                    mod = modules.find(function (mod) { return mod.name === refMod; });
                    return [2 /*return*/, mod === null || mod === void 0 ? void 0 : mod.methods.get(normalizedRef)];
            }
        });
    });
}
var cliSpec;
export function getCliSpec() {
    return __awaiter(this, void 0, void 0, function () {
        var rawSpec;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!cliSpec) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'spec', 'cli_v1_commands.yaml'), 'utf-8')];
                case 1:
                    rawSpec = _a.sent();
                    cliSpec = parse(rawSpec);
                    _a.label = 2;
                case 2: return [2 /*return*/, cliSpec];
            }
        });
    });
}
var apiEndpointsById;
export function getApiEndpointById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var rawJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!apiEndpointsById) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', './generated/api.latest.endpointsById.json'), 'utf-8')];
                case 1:
                    rawJson = _a.sent();
                    apiEndpointsById = new Map(JSON.parse(rawJson));
                    _a.label = 2;
                case 2: return [2 /*return*/, apiEndpointsById.get(id)];
            }
        });
    });
}
var selfHostedEndpointsById = new Map();
export function getSelfHostedApiEndpointById(servicePath, id) {
    return __awaiter(this, void 0, void 0, function () {
        var rawJson;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!selfHostedEndpointsById.has(servicePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', "./generated/".concat(servicePath, ".latest.endpointsById.json")), 'utf-8')];
                case 1:
                    rawJson = _b.sent();
                    selfHostedEndpointsById.set(servicePath, new Map(JSON.parse(rawJson)));
                    _b.label = 2;
                case 2: return [2 /*return*/, (_a = selfHostedEndpointsById.get(servicePath)) === null || _a === void 0 ? void 0 : _a.get(id)];
            }
        });
    });
}
var functionsList = new Map();
export function getFunctionsList(sdkId, version) {
    return __awaiter(this, void 0, void 0, function () {
        var key, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = "".concat(sdkId, ".").concat(version);
                    if (!!functionsList.has(key)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', "./generated/".concat(sdkId, ".").concat(version, ".functions.json")), 'utf-8')];
                case 1:
                    data = _a.sent();
                    functionsList.set(key, JSON.parse(data));
                    _a.label = 2;
                case 2: return [2 /*return*/, functionsList.get(key)];
            }
        });
    });
}
var referenceSections = new Map();
export function getReferenceSections(sdkId, version) {
    return __awaiter(this, void 0, void 0, function () {
        var key, data, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = "".concat(sdkId, ".").concat(version);
                    if (!!referenceSections.has(key)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', "./generated/".concat(sdkId, ".").concat(version, ".sections.json")), 'utf-8')];
                case 1:
                    data = _a.sent();
                    referenceSections.set(key, JSON.parse(data));
                    _a.label = 2;
                case 2:
                    result = referenceSections.get(key);
                    return [2 /*return*/, result];
            }
        });
    });
}
var flatSections = new Map();
export function getFlattenedSections(sdkId, version) {
    return __awaiter(this, void 0, void 0, function () {
        var key, data, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = "".concat(sdkId, ".").concat(version);
                    if (!!flatSections.has(key)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', "./generated/".concat(sdkId, ".").concat(version, ".flat.json")), 'utf-8')];
                case 1:
                    data = _a.sent();
                    flatSections.set(key, JSON.parse(data));
                    _a.label = 2;
                case 2:
                    result = flatSections.get(key);
                    return [2 /*return*/, result];
            }
        });
    });
}
var sectionsBySlug = new Map();
export function getSectionsBySlug(sdkId, version) {
    return __awaiter(this, void 0, void 0, function () {
        var key, data, asObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = "".concat(sdkId, ".").concat(version);
                    if (!!sectionsBySlug.has(key)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFile(join(process.cwd(), 'features/docs', "./generated/".concat(sdkId, ".").concat(version, ".bySlug.json")), 'utf-8')];
                case 1:
                    data = _a.sent();
                    asObject = JSON.parse(data);
                    sectionsBySlug.set(key, new Map(Object.entries(asObject)));
                    _a.label = 2;
                case 2: return [2 /*return*/, sectionsBySlug.get(key)];
            }
        });
    });
}
