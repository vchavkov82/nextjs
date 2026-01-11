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
import { GuideModelLoader } from '../../../resources/guide/guideModelLoader.js';
import { GitHubDiscussionLoader, fetchDiscussions, } from './github-discussion.js';
import { LintWarningsGuideLoader } from './lint-warnings-guide.js';
import { MarkdownLoader } from './markdown.js';
import { IntegrationLoader, fetchPartners } from './partner-integrations.js';
import { CliReferenceLoader, ClientLibReferenceLoader, OpenApiReferenceLoader, } from './reference-doc.js';
export function fetchGuideSources() {
    return __awaiter(this, void 0, void 0, function () {
        var guides;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GuideModelLoader.allFromFs()];
                case 1:
                    guides = (_a.sent()).unwrapLeft();
                    return [2 /*return*/, guides.map(function (guide) { return MarkdownLoader.fromGuideModel('guide', guide); })];
            }
        });
    });
}
export function fetchOpenApiReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new OpenApiReferenceLoader('api', '/reference/api', { title: 'Management API Reference' }, 'spec/transforms/api_v1_openapi_deparsed.json', 'spec/common-api-sections.json').load()];
        });
    });
}
export function fetchJsLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ClientLibReferenceLoader('js-lib', '/reference/javascript', { title: 'JavaScript Reference', language: 'JavaScript' }, 'spec/supabase_js_v2.yml', 'spec/common-client-libs-sections.json').load()];
        });
    });
}
export function fetchDartLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ClientLibReferenceLoader('dart-lib', '/reference/dart', { title: 'Dart Reference', language: 'Dart' }, 'spec/supabase_dart_v2.yml', 'spec/common-client-libs-sections.json').load()];
        });
    });
}
export function fetchPythonLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ClientLibReferenceLoader('python-lib', '/reference/python', { title: 'Python Reference', language: 'Python' }, 'spec/supabase_py_v2.yml', 'spec/common-client-libs-sections.json').load()];
        });
    });
}
export function fetchCSharpLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ClientLibReferenceLoader('csharp-lib', '/reference/csharp', { title: 'C# Reference', language: 'C#' }, 'spec/supabase_csharp_v0.yml', 'spec/common-client-libs-sections.json').load()];
        });
    });
}
export function fetchSwiftLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ClientLibReferenceLoader('swift-lib', '/reference/swift', { title: 'Swift Reference', language: 'Swift' }, 'spec/supabase_swift_v2.yml', 'spec/common-client-libs-sections.json').load()];
        });
    });
}
export function fetchKtLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ClientLibReferenceLoader('kt-lib', '/reference/kotlin', { title: 'Kotlin Reference', language: 'Kotlin' }, 'spec/supabase_kt_v1.yml', 'spec/common-client-libs-sections.json').load()];
        });
    });
}
export function fetchCliLibReferenceSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new CliReferenceLoader('cli', '/reference/cli', { title: 'CLI Reference', platform: 'cli' }, 'spec/cli_v1_commands.yaml', 'spec/common-cli-sections.json').load()];
        });
    });
}
export function fetchLintWarningsGuideSources() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new LintWarningsGuideLoader('guide', '/guides/database/database-advisors', 'supabase', 'splinter', 'main', 'docs').load()];
        });
    });
}
/**
 * Fetches all the sources we want to index for search
 */
export function fetchAllSources(fullIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var guideSources, lintWarningsGuideSources, openApiReferenceSource, jsLibReferenceSource, dartLibReferenceSource, pythonLibReferenceSource, cSharpLibReferenceSource, swiftLibReferenceSource, ktLibReferenceSource, cliReferenceSource, partnerIntegrationSources, githubDiscussionSources, sources;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guideSources = fetchGuideSources();
                    lintWarningsGuideSources = fetchLintWarningsGuideSources();
                    openApiReferenceSource = fetchOpenApiReferenceSource();
                    jsLibReferenceSource = fetchJsLibReferenceSource();
                    dartLibReferenceSource = fullIndex ? fetchDartLibReferenceSource() : [];
                    pythonLibReferenceSource = fullIndex ? fetchPythonLibReferenceSource() : [];
                    cSharpLibReferenceSource = fullIndex ? fetchCSharpLibReferenceSource() : [];
                    swiftLibReferenceSource = fullIndex ? fetchSwiftLibReferenceSource() : [];
                    ktLibReferenceSource = fullIndex ? fetchKtLibReferenceSource() : [];
                    cliReferenceSource = fullIndex ? fetchCliLibReferenceSource() : [];
                    partnerIntegrationSources = fullIndex
                        ? fetchPartners()
                            .then(function (partners) {
                            return partners
                                ? Promise.all(partners.map(function (partner) { return new IntegrationLoader(partner.slug, partner).load(); }))
                                : [];
                        })
                            .then(function (data) { return data.flat(); })
                        : [];
                    githubDiscussionSources = fetchDiscussions('supabase', 'supabase', 'DIC_kwDODMpXOc4CUvEr' // 'Troubleshooting' category
                    )
                        .then(function (discussions) {
                        return Promise.all(discussions.map(function (discussion) {
                            return new GitHubDiscussionLoader('supabase/supabase', discussion).load();
                        }));
                    })
                        .then(function (data) { return data.flat(); });
                    return [4 /*yield*/, Promise.all([
                            guideSources,
                            lintWarningsGuideSources,
                            openApiReferenceSource,
                            jsLibReferenceSource,
                            dartLibReferenceSource,
                            pythonLibReferenceSource,
                            cSharpLibReferenceSource,
                            swiftLibReferenceSource,
                            ktLibReferenceSource,
                            cliReferenceSource,
                            partnerIntegrationSources,
                            githubDiscussionSources,
                        ])];
                case 1:
                    sources = (_a.sent()).flat();
                    return [2 /*return*/, sources];
            }
        });
    });
}
