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
import { createClient } from '@supabase/supabase-js';
import { upperFirst } from 'lodash-es';
import { processMdx } from '../../helpers.mdx.js';
import { BaseLoader, BaseSource } from './base.js';
var supabaseUrl = process.env.NEXT_PUBLIC_MISC_URL;
var supabaseAnonKey = process.env.NEXT_PUBLIC_MISC_ANON_KEY;
var supabaseClient;
function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
}
export function fetchPartners() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, partners;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    supabase = getSupabaseClient();
                    return [4 /*yield*/, supabase
                            .from('partners')
                            .select('slug,overview')
                            .eq('approved', true)
                            // We want to show technology integrations, not agencies, in search
                            .neq('type', 'expert')];
                case 1:
                    partners = (_a.sent()).data;
                    return [2 /*return*/, partners !== null && partners !== void 0 ? partners : []];
            }
        });
    });
}
var IntegrationLoader = /** @class */ (function (_super) {
    __extends(IntegrationLoader, _super);
    function IntegrationLoader(source, partnerData) {
        var _this = this;
        var relPath = "/partners/integrations/".concat(partnerData.slug);
        _this = _super.call(this, source, relPath) || this;
        _this.partnerData = partnerData;
        _this.type = 'partner-integration';
        return _this;
    }
    IntegrationLoader.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [new IntegrationSource(this.source, this.path, this.partnerData)]];
            });
        });
    };
    return IntegrationLoader;
}(BaseLoader));
export { IntegrationLoader };
var IntegrationSource = /** @class */ (function (_super) {
    __extends(IntegrationSource, _super);
    function IntegrationSource(source, path, partnerData) {
        var _this = _super.call(this, source, path) || this;
        _this.partnerData = partnerData;
        _this.type = 'partner-integration';
        return _this;
    }
    IntegrationSource.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, checksum, sections, meta;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, processMdx(this.partnerData.overview)];
                    case 1:
                        _a = _b.sent(), checksum = _a.checksum, sections = _a.sections;
                        meta = {
                            title: upperFirst(this.partnerData.slug),
                            subtitle: 'Integration',
                        };
                        this.checksum = checksum;
                        this.meta = meta;
                        this.sections = sections;
                        return [2 /*return*/, {
                                checksum: checksum,
                                meta: meta,
                                ragIgnore: true,
                                sections: sections,
                            }];
                }
            });
        });
    };
    IntegrationSource.prototype.extractIndexedContent = function () {
        var _a, _b, _c;
        var sections = (_a = this.sections) !== null && _a !== void 0 ? _a : [];
        var result = ((_c = (_b = this.meta) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : '') + '\n\n' + sections.map(function (_a) {
            var content = _a.content;
            return content;
        }).join('\n\n');
        return result;
    };
    return IntegrationSource;
}(BaseSource));
export { IntegrationSource };
