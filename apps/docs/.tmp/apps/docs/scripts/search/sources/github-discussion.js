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
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/core';
import { paginateGraphql } from '@octokit/plugin-paginate-graphql';
import crypto from 'node:crypto';
import { BaseLoader, BaseSource } from './base.js';
export var ExtendedOctokit = Octokit.plugin(paginateGraphql);
var appId = process.env.DOCS_GITHUB_APP_ID;
var installationId = process.env.DOCS_GITHUB_APP_INSTALLATION_ID;
var privateKey = process.env.DOCS_GITHUB_APP_PRIVATE_KEY;
/**
 * Fetches GitHub discussions for a repository + category
 */
export function fetchDiscussions(owner, repo, categoryId) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, discussions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = new ExtendedOctokit({
                        authStrategy: createAppAuth,
                        auth: {
                            appId: appId,
                            installationId: installationId,
                            privateKey: crypto.createPrivateKey(privateKey).export({ type: 'pkcs8', format: 'pem' }),
                        },
                    });
                    return [4 /*yield*/, octokit.graphql.paginate("\n      query troubleshootDiscussions($cursor: String, $owner: String!, $repo: String!, $categoryId: ID!) {\n        repository(owner: $owner, name: $repo) {\n          discussions(first: 100, after: $cursor, categoryId: $categoryId) {\n            totalCount\n            nodes {\n              id\n              updatedAt\n              url\n              title\n              body\n              databaseId\n            }\n            pageInfo {\n              hasNextPage\n              endCursor\n            }\n          }\n        }\n      }\n    ", {
                            owner: owner,
                            repo: repo,
                            categoryId: categoryId,
                        })];
                case 1:
                    discussions = (_a.sent()).repository.discussions.nodes;
                    return [2 /*return*/, discussions];
            }
        });
    });
}
var GitHubDiscussionLoader = /** @class */ (function (_super) {
    __extends(GitHubDiscussionLoader, _super);
    function GitHubDiscussionLoader(source, discussion) {
        var _this = _super.call(this, source, discussion.url) || this;
        _this.discussion = discussion;
        _this.type = 'github-discussions';
        return _this;
    }
    GitHubDiscussionLoader.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [new GitHubDiscussionSource(this.source, this.path, this.discussion)]];
            });
        });
    };
    return GitHubDiscussionLoader;
}(BaseLoader));
export { GitHubDiscussionLoader };
var GitHubDiscussionSource = /** @class */ (function (_super) {
    __extends(GitHubDiscussionSource, _super);
    function GitHubDiscussionSource(source, path, discussion) {
        var _this = _super.call(this, source, path) || this;
        _this.discussion = discussion;
        _this.type = 'github-discussions';
        return _this;
    }
    GitHubDiscussionSource.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, title, updatedAt, body, databaseId, checksum, meta, slug, content, sections;
            return __generator(this, function (_b) {
                _a = this.discussion, id = _a.id, title = _a.title, updatedAt = _a.updatedAt, body = _a.body, databaseId = _a.databaseId;
                checksum = crypto.createHash('sha256').update(updatedAt).digest('base64');
                meta = { id: id, title: title, updatedAt: updatedAt };
                slug = "discussion-".concat(databaseId);
                content = "# ".concat(title, "\n").concat(body);
                sections = [
                    {
                        heading: title,
                        slug: slug,
                        content: content,
                    },
                ];
                this.checksum = checksum;
                this.meta = meta;
                this.sections = sections;
                return [2 /*return*/, {
                        checksum: checksum,
                        meta: meta,
                        sections: sections,
                    }];
            });
        });
    };
    GitHubDiscussionSource.prototype.extractIndexedContent = function () {
        var _a;
        var sections = (_a = this.sections) !== null && _a !== void 0 ? _a : [];
        return sections.map(function (_a) {
            var heading = _a.heading, content = _a.content;
            return "".concat(heading, "\n\n").concat(content);
        }).join('\n');
    };
    return GitHubDiscussionSource;
}(BaseSource));
export { GitHubDiscussionSource };
