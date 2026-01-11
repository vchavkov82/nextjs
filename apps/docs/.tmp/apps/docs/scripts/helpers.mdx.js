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
import GithubSlugger from 'github-slugger';
import matter from 'gray-matter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx';
import { toString } from 'mdast-util-to-string';
import { mdxjs } from 'micromark-extension-mdxjs';
import { u } from 'unist-builder';
function createHash(content) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, data, hashBuffer, hashArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    data = encoder.encode(content);
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', data)];
                case 1:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    return [2 /*return*/, hashArray.map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('')];
            }
        });
    });
}
/**
 * Process MDX content.
 *
 * Splits MDX content into sections based on headings, and calculates checksum.
 */
function processMdx(content, options) {
    return __awaiter(this, void 0, void 0, function () {
        var checksum, frontmatter, parsed, mdxTree, sectionTrees, slugger, sections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createHash(content)];
                case 1:
                    checksum = _a.sent();
                    frontmatter = {};
                    if (options === null || options === void 0 ? void 0 : options.yaml) {
                        parsed = matter(content);
                        frontmatter = parsed.data;
                        content = parsed.content;
                    }
                    mdxTree = fromMarkdown(content, {
                        extensions: [mdxjs()],
                        mdastExtensions: [mdxFromMarkdown()],
                    });
                    sectionTrees = splitTreeBy(mdxTree, function (node) { return node.type === 'heading'; });
                    slugger = new GithubSlugger();
                    sections = sectionTrees.map(function (tree) {
                        var firstNode = tree.children[0];
                        var content = toMarkdown(tree, {
                            extensions: [mdxToMarkdown()],
                        });
                        var rawHeading = firstNode.type === 'heading' ? toString(firstNode) : undefined;
                        if (!rawHeading) {
                            return { content: content };
                        }
                        var _a = parseHeading(rawHeading), heading = _a.heading, customAnchor = _a.customAnchor;
                        var slug = slugger.slug(customAnchor !== null && customAnchor !== void 0 ? customAnchor : heading);
                        return {
                            content: content,
                            heading: heading,
                            slug: slug,
                        };
                    });
                    return [2 /*return*/, {
                            checksum: checksum,
                            sections: sections,
                            meta: frontmatter,
                        }];
            }
        });
    });
}
/**
 * Splits a `mdast` tree into multiple trees based on
 * a predicate function. Will include the splitting node
 * at the beginning of each tree.
 *
 * Useful to split a markdown file into smaller sections.
 */
function splitTreeBy(tree, predicate) {
    return tree.children.reduce(function (trees, node) {
        var lastTree = trees.slice(-1)[0];
        if (!lastTree || predicate(node)) {
            var tree_1 = u('root', [node]);
            return trees.concat(tree_1);
        }
        lastTree.children.push(node);
        return trees;
    }, []);
}
/**
 * Parses a markdown heading which can optionally
 * contain a custom anchor in the format:
 *
 * ```markdown
 * ### My Heading [#my-custom-anchor]
 * ```
 */
function parseHeading(heading) {
    var match = heading.match(/(.*) *\[#(.*)\]/);
    if (match) {
        var heading_1 = match[1], customAnchor = match[2];
        return { heading: heading_1, customAnchor: customAnchor };
    }
    return { heading: heading };
}
export { processMdx };
