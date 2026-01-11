var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import crypto from 'crypto';
import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { getApiEndpointById } from '../../../features/docs/Reference.generated.singleton.js';
import { flattenSections } from '../../../lib/helpers.js';
import { gen_v3 } from '../../../lib/refGenerator/helpers.js';
import { BaseLoader, BaseSource } from './base.js';
var ReferenceLoader = /** @class */ (function (_super) {
    __extends(ReferenceLoader, _super);
    function ReferenceLoader(source, path, meta, specFilePath, sectionsFilePath) {
        var _this = _super.call(this, source, path) || this;
        _this.meta = meta;
        _this.specFilePath = specFilePath;
        _this.sectionsFilePath = sectionsFilePath;
        _this.type = 'reference';
        return _this;
    }
    ReferenceLoader.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var specContents, refSectionsContents, refSections, flattenedRefSections, specSections, sections;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, readFile(this.specFilePath, 'utf8')];
                    case 1:
                        specContents = _a.sent();
                        return [4 /*yield*/, readFile(this.sectionsFilePath, 'utf8')];
                    case 2:
                        refSectionsContents = _a.sent();
                        refSections = JSON.parse(refSectionsContents);
                        flattenedRefSections = flattenSections(refSections);
                        specSections = this.getSpecSections(specContents);
                        return [4 /*yield*/, Promise.all(flattenedRefSections.map(function (refSection) { return __awaiter(_this, void 0, void 0, function () {
                                var specSection;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.matchSpecSection(specSections, refSection.id)];
                                        case 1:
                                            specSection = _a.sent();
                                            if (!specSection) {
                                                return [2 /*return*/];
                                            }
                                            return [2 /*return*/, this.sourceConstructor(this.source, "".concat(this.path, "/").concat(refSection.slug), refSection, specSection, this.enhanceMeta(specSection))];
                                    }
                                });
                            }); }))];
                    case 3:
                        sections = (_a.sent()).filter(function (item) { return item !== undefined; });
                        return [2 /*return*/, sections];
                }
            });
        });
    };
    ReferenceLoader.prototype.enhanceMeta = function (_section) {
        return this.meta;
    };
    return ReferenceLoader;
}(BaseLoader));
export { ReferenceLoader };
var ReferenceSource = /** @class */ (function (_super) {
    __extends(ReferenceSource, _super);
    function ReferenceSource(source, path, refSection, specSection, meta) {
        var _this = _super.call(this, source, path) || this;
        _this.refSection = refSection;
        _this.specSection = specSection;
        _this.meta = meta;
        _this.type = 'reference';
        return _this;
    }
    ReferenceSource.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            var checksum, sections;
            return __generator(this, function (_a) {
                checksum = crypto.createHash('sha256')
                    .update(JSON.stringify(this.refSection) + JSON.stringify(this.specSection))
                    .digest('base64');
                sections = [
                    {
                        heading: this.refSection.title,
                        slug: this.refSection.slug,
                        content: "".concat(this.meta.title, " for ").concat(this.refSection.title, ":\n").concat(this.formatSection(this.specSection, this.refSection)),
                    },
                ];
                this.checksum = checksum;
                this.sections = sections;
                return [2 /*return*/, {
                        checksum: checksum,
                        sections: sections,
                        meta: __assign(__assign({}, this.meta), { subtitle: this.extractSubtitle(), title: this.extractTitle() }),
                    }];
            });
        });
    };
    return ReferenceSource;
}(BaseSource));
export { ReferenceSource };
var OpenApiReferenceLoader = /** @class */ (function (_super) {
    __extends(OpenApiReferenceLoader, _super);
    function OpenApiReferenceLoader(source, path, meta, specFilePath, sectionsFilePath) {
        var _this = _super.call(this, source, path, meta, specFilePath, sectionsFilePath) || this;
        _this.sourceConstructor = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (OpenApiReferenceSource.bind.apply(OpenApiReferenceSource, __spreadArray([void 0], args, false)))();
        };
        return _this;
    }
    OpenApiReferenceLoader.prototype.getSpecSections = function (specContents) {
        var spec = JSON.parse(specContents);
        var generatedSpec = gen_v3(spec, '', {
            apiUrl: 'apiv0',
        });
        return generatedSpec.operations;
    };
    OpenApiReferenceLoader.prototype.matchSpecSection = function (_operations, id) {
        return __awaiter(this, void 0, void 0, function () {
            var apiEndpoint, enrichedOp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getApiEndpointById(id)];
                    case 1:
                        apiEndpoint = _a.sent();
                        if (!apiEndpoint)
                            return [2 /*return*/, undefined];
                        enrichedOp = {
                            operationId: apiEndpoint.id,
                            operation: apiEndpoint.method,
                            path: apiEndpoint.path,
                            summary: apiEndpoint.summary,
                            description: apiEndpoint.description,
                            deprecated: apiEndpoint.deprecated,
                            parameters: apiEndpoint.parameters,
                            requestBody: apiEndpoint.requestBody,
                            responses: apiEndpoint.responses,
                        };
                        return [2 /*return*/, enrichedOp];
                }
            });
        });
    };
    return OpenApiReferenceLoader;
}(ReferenceLoader));
export { OpenApiReferenceLoader };
var OpenApiReferenceSource = /** @class */ (function (_super) {
    __extends(OpenApiReferenceSource, _super);
    function OpenApiReferenceSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenApiReferenceSource.prototype.formatSection = function (specOperation, _) {
        var summary = specOperation.summary, description = specOperation.description, operation = specOperation.operation, path = specOperation.path, tags = specOperation.tags, parameters = specOperation.parameters, responses = specOperation.responses, operationId = specOperation.operationId;
        return JSON.stringify({
            summary: summary,
            description: description,
            operation: operation,
            path: path,
            tags: tags,
            parameters: parameters,
            responses: responses,
            operationId: operationId,
        });
    };
    OpenApiReferenceSource.prototype.extractSubtitle = function () {
        return "".concat(this.meta.title, ": ").concat(this.specSection.description || this.specSection.operationId || '');
    };
    OpenApiReferenceSource.prototype.extractTitle = function () {
        return (this.specSection.summary ||
            (typeof this.meta.title === 'string' ? this.meta.title : this.specSection.operation) ||
            '');
    };
    OpenApiReferenceSource.prototype.extractIndexedContent = function () {
        var _a;
        var _b = this.specSection, summary = _b.summary, description = _b.description, operation = _b.operation, tags = _b.tags, path = _b.path, parameters = _b.parameters, responses = _b.responses;
        var sections = [];
        // Title
        sections.push("# ".concat((_a = this.meta.title) !== null && _a !== void 0 ? _a : ''));
        // Summary
        if (summary) {
            sections.push(summary);
        }
        // Description
        if (description) {
            sections.push("Description: ".concat(description));
        }
        // Path and Method
        if (path) {
            sections.push("Path: ".concat((operation === null || operation === void 0 ? void 0 : operation.toUpperCase()) || 'GET', " ").concat(path));
        }
        // Parameters
        if (parameters && parameters.length > 0) {
            var paramList = parameters
                .map(function (param) {
                var _a;
                var required = param.required ? 'required' : 'optional';
                return "- ".concat(param.name, " (").concat(((_a = param.schema) === null || _a === void 0 ? void 0 : _a.type) || 'string', ", ").concat(required, "): ").concat(param.description || '');
            })
                .join('\n');
            sections.push("Parameters:\n".concat(paramList));
        }
        // Response Types
        if (responses) {
            var responseList = Object.entries(responses)
                .map(function (_a) {
                var code = _a[0], response = _a[1];
                var desc = response.description || 'No description';
                return "- ".concat(code, ": ").concat(desc);
            })
                .join('\n');
            sections.push("Responses:\n".concat(responseList));
        }
        // Tags
        if (tags && tags.length > 0) {
            sections.push("Tags: ".concat(tags.join(', ')));
        }
        return sections.filter(Boolean).join('\n\n');
    };
    return OpenApiReferenceSource;
}(ReferenceSource));
export { OpenApiReferenceSource };
var ClientLibReferenceLoader = /** @class */ (function (_super) {
    __extends(ClientLibReferenceLoader, _super);
    function ClientLibReferenceLoader(source, path, meta, specFilePath, sectionsFilePath) {
        var _this = _super.call(this, source, path, meta, specFilePath, sectionsFilePath) || this;
        _this.sourceConstructor = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (ClientLibReferenceSource.bind.apply(ClientLibReferenceSource, __spreadArray([void 0], args, false)))();
        };
        return _this;
    }
    ClientLibReferenceLoader.prototype.getSpecSections = function (specContents) {
        var spec = yaml.load(specContents);
        return spec.functions;
    };
    ClientLibReferenceLoader.prototype.matchSpecSection = function (functionDefinitions, id) {
        return functionDefinitions.find(function (functionDefinition) { return functionDefinition.id === id; });
    };
    ClientLibReferenceLoader.prototype.enhanceMeta = function (section) {
        return __assign(__assign({}, this.meta), { slug: section.id, methodName: section.title });
    };
    return ClientLibReferenceLoader;
}(ReferenceLoader));
export { ClientLibReferenceLoader };
var ClientLibReferenceSource = /** @class */ (function (_super) {
    __extends(ClientLibReferenceSource, _super);
    function ClientLibReferenceSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClientLibReferenceSource.prototype.formatSection = function (functionDefinition, refSection) {
        var title = refSection.title;
        var description = functionDefinition.description, functionName = functionDefinition.title;
        return JSON.stringify({
            title: title,
            description: description,
            functionName: functionName,
        });
    };
    ClientLibReferenceSource.prototype.extractTitle = function () {
        return this.specSection.title;
    };
    ClientLibReferenceSource.prototype.extractSubtitle = function () {
        return "".concat(this.meta.title, ": ").concat(this.refSection.title);
    };
    ClientLibReferenceSource.prototype.extractIndexedContent = function () {
        var _a, _b;
        var _c = this.specSection, title = _c.title, description = _c.description, examples = _c.examples;
        var exampleText = (_a = examples === null || examples === void 0 ? void 0 : examples.map(function (example) { var _a, _b; return "### ".concat((_a = example.name) !== null && _a !== void 0 ? _a : '', "\n\n").concat((_b = example.code) !== null && _b !== void 0 ? _b : ''); }).join('\n\n')) !== null && _a !== void 0 ? _a : '';
        return "# ".concat((_b = this.meta.title) !== null && _b !== void 0 ? _b : '', "\n\n").concat(title !== null && title !== void 0 ? title : '', "\n\n").concat(description !== null && description !== void 0 ? description : '', "\n\n## Examples\n\n").concat(exampleText);
    };
    return ClientLibReferenceSource;
}(ReferenceSource));
export { ClientLibReferenceSource };
var CliReferenceLoader = /** @class */ (function (_super) {
    __extends(CliReferenceLoader, _super);
    function CliReferenceLoader(source, path, meta, specFilePath, sectionsFilePath) {
        var _this = _super.call(this, source, path, meta, specFilePath, sectionsFilePath) || this;
        _this.sourceConstructor = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (CliReferenceSource.bind.apply(CliReferenceSource, __spreadArray([void 0], args, false)))();
        };
        return _this;
    }
    CliReferenceLoader.prototype.getSpecSections = function (specContents) {
        var spec = yaml.load(specContents);
        return spec.commands;
    };
    CliReferenceLoader.prototype.matchSpecSection = function (cliCommands, id) {
        return cliCommands.find(function (cliCommand) { return cliCommand.id === id; });
    };
    return CliReferenceLoader;
}(ReferenceLoader));
export { CliReferenceLoader };
var CliReferenceSource = /** @class */ (function (_super) {
    __extends(CliReferenceSource, _super);
    function CliReferenceSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CliReferenceSource.prototype.formatSection = function (cliCommand, _) {
        var summary = cliCommand.summary, description = cliCommand.description, usage = cliCommand.usage;
        return JSON.stringify({
            summary: summary,
            description: description,
            usage: usage,
        });
    };
    CliReferenceSource.prototype.extractSubtitle = function () {
        return "".concat(this.meta.title, ": ").concat(this.specSection.title);
    };
    CliReferenceSource.prototype.extractTitle = function () {
        return this.specSection.summary;
    };
    CliReferenceSource.prototype.extractIndexedContent = function () {
        var _a;
        var _b = this.specSection, summary = _b.summary, description = _b.description, usage = _b.usage;
        return "# ".concat((_a = this.meta.title) !== null && _a !== void 0 ? _a : '', "\n\n").concat(summary !== null && summary !== void 0 ? summary : '', "\n\n").concat(description !== null && description !== void 0 ? description : '', "\n\n").concat(usage !== null && usage !== void 0 ? usage : '');
    };
    return CliReferenceSource;
}(ReferenceSource));
export { CliReferenceSource };
