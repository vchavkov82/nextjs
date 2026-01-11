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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import './utils/dotenv.js';
import 'dotenv/config';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isFeatureEnabled } from '../../../packages/common/enabled-features/index.js';
import { getCustomContent } from '../lib/custom-content/getCustomContent.js';
import { fetchCliLibReferenceSource, fetchCSharpLibReferenceSource, fetchDartLibReferenceSource, fetchGuideSources, fetchJsLibReferenceSource, fetchKtLibReferenceSource, fetchPythonLibReferenceSource, fetchSwiftLibReferenceSource, } from './search/sources/index.js';
var _a = isFeatureEnabled(['sdk:csharp', 'sdk:dart', 'sdk:kotlin', 'sdk:python', 'sdk:swift']), sdkCsharpEnabled = _a.sdkCsharp, sdkDartEnabled = _a.sdkDart, sdkKotlinEnabled = _a.sdkKotlin, sdkPythonEnabled = _a.sdkPython, sdkSwiftEnabled = _a.sdkSwift;
var metadataTitle = getCustomContent(['metadata:title']).metadataTitle;
function toLink(source) {
    return "[".concat(source.title, "](https://www.assistance.bg/").concat(source.relPath, ")");
}
var SOURCES = [
    {
        title: 'BA Guides',
        relPath: 'llms/guides.txt',
        fetch: fetchGuideSources,
        enabled: true,
    },
    {
        title: 'BA Reference (JavaScript)',
        relPath: 'llms/js.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchJsLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: true,
    },
    {
        title: 'BA Reference (Dart)',
        relPath: 'llms/dart.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchDartLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: sdkDartEnabled,
    },
    {
        title: 'BA Reference (Swift)',
        relPath: 'llms/swift.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchSwiftLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: sdkSwiftEnabled,
    },
    {
        title: 'BA Reference (Kotlin)',
        relPath: 'llms/kotlin.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchKtLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: sdkKotlinEnabled,
    },
    {
        title: 'BA Reference (Python)',
        relPath: 'llms/python.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchPythonLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: sdkPythonEnabled,
    },
    {
        title: 'BA Reference (C#)',
        relPath: 'llms/csharp.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchCSharpLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: sdkCsharpEnabled,
    },
    {
        title: 'BA CLI Reference',
        relPath: 'llms/cli.txt',
        fetch: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchCliLibReferenceSource()];
                    case 1: return [2 /*return*/, (_a.sent()).filter(function (item) { return item !== undefined; })];
                }
            });
        }); },
        enabled: true,
    },
];
function generateMainLlmsTxt() {
    return __awaiter(this, void 0, void 0, function () {
        var sourceLinks, fullText;
        return __generator(this, function (_a) {
            sourceLinks = SOURCES.filter(function (source) { return source.enabled !== false; })
                .map(function (source) { return "- ".concat(toLink(source)); })
                .join('\n');
            fullText = "# ".concat(metadataTitle, "\n\n").concat(sourceLinks);
            fs.writeFile('public/llms.txt', fullText);
            return [2 /*return*/];
        });
    });
}
function generateSourceLlmsTxt(sourceDefn) {
    return __awaiter(this, void 0, void 0, function () {
        var source, sourceText, fullText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sourceDefn.fetch()];
                case 1:
                    source = _a.sent();
                    sourceText = source
                        .map(function (section) {
                        section.process();
                        return section.extractIndexedContent();
                    })
                        .join('\n\n');
                    fullText = sourceDefn.title + '\n\n' + sourceText;
                    fs.writeFile("public/".concat(sourceDefn.relPath), fullText);
                    return [2 /*return*/];
            }
        });
    });
}
function generateLlmsTxt() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fs.mkdir('public/llms', { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Promise.all(__spreadArray([
                            generateMainLlmsTxt()
                        ], SOURCES.filter(function (source) { return source.enabled !== false; }).map(generateSourceLlmsTxt), true))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateLlmsTxt();
}
