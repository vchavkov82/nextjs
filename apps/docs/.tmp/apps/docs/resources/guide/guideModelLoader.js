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
import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { extractMessageFromAnyError, FileNotFoundError, MultiError } from '~/app/api/utils';
import { preprocessMdxWithDefaults } from '~/features/directives/utils';
import { checkGuidePageEnabled } from '~/features/docs/NavigationPageStatus.utils';
import { Both, Result } from '~/features/helpers.fn';
import { GUIDES_DIRECTORY } from '~/lib/docs';
import { processMdx } from '~/scripts/helpers.mdx';
import { GuideModel } from './guideModel';
/**
 * Ensures that no frontmatter delimiters remain in the content.
 * This is critical to prevent the MDX compiler from trying to parse
 * frontmatter and causing "this.getData is not a function" errors.
 */
function ensureFrontmatterRemoved(content) {
    var _a;
    if (!content || typeof content !== 'string')
        return '';
    var cleaned = content;
    // Remove YAML frontmatter (--- ... ---) - most common format
    cleaned = cleaned.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/m, '');
    // Remove TOML frontmatter (+++ ... +++), though less common
    cleaned = cleaned.replace(/^\+\+\+\s*\n[\s\S]*?\n\+\+\+\s*\n?/m, '');
    // If still starts with ---, manually find and skip frontmatter block
    if (cleaned.trim().startsWith('---')) {
        var lines = cleaned.split('\n');
        var startIndex = 0;
        if (((_a = lines[0]) === null || _a === void 0 ? void 0 : _a.trim()) === '---') {
            // Find the closing ---
            var closingIndex = lines.findIndex(function (line, idx) { return idx > 0 && line.trim() === '---'; });
            if (closingIndex > 0) {
                startIndex = closingIndex + 1;
            }
            else {
                // No closing found, skip until first content line
                startIndex = lines.findIndex(function (line, idx) {
                    return idx > 0 &&
                        line.trim() !== '' &&
                        line.trim() !== '---' &&
                        !line.match(/^[\w-]+:\s*/);
                } // Skip YAML key:value lines
                );
                if (startIndex < 0)
                    startIndex = 1; // Skip at least the opening ---
            }
        }
        cleaned = lines.slice(startIndex).join('\n');
    }
    // Trim leading whitespace
    cleaned = cleaned.trimStart();
    return cleaned;
}
/**
 * Determines if a file is hidden.
 *
 * A file is hidden if its name, or the name of any of its parent directories,
 * starts with an underscore.
 */
function isHiddenFile(path) {
    return path.split('/').some(function (part) { return part.startsWith('_'); });
}
/**
 * Determines if a guide file is disabled in the navigation configuration.
 *
 * @param relPath - Relative path to the .mdx file within the base directory
 * @param baseDir - Base directory to calculate relPath from
 * @returns true if the page is disabled, false if enabled
 */
function isDisabledGuide(relPath, baseDir) {
    var fullPath = resolve(baseDir, relPath);
    if (!fullPath.startsWith(GUIDES_DIRECTORY))
        return false;
    var relGuidePath = relative(GUIDES_DIRECTORY, fullPath);
    var urlPath = relGuidePath.replace(/\.mdx?$/, '').replace(/\/index$/, '');
    var guidesPath = "/guides/".concat(urlPath);
    return !checkGuidePageEnabled(guidesPath);
}
/**
 * Recursively walks a directory and collects all .mdx files that are not hidden.
 */
function walkMdxFiles(dir, multiError) {
    return __awaiter(this, void 0, void 0, function () {
        var readDirResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Result.tryCatch(function () { return fs.readdir(dir, { recursive: true }); }, function (error) { return error; })];
                case 1:
                    readDirResult = _a.sent();
                    return [2 /*return*/, readDirResult.match(function (allPaths) {
                            var mdxFiles = [];
                            for (var _i = 0, allPaths_1 = allPaths; _i < allPaths_1.length; _i++) {
                                var relativePath = allPaths_1[_i];
                                if (isHiddenFile(relativePath)) {
                                    continue;
                                }
                                if (isDisabledGuide(relativePath, dir)) {
                                    continue;
                                }
                                if (relativePath.endsWith('.mdx')) {
                                    mdxFiles.push(join(dir, relativePath));
                                }
                            }
                            return mdxFiles;
                        }, function (error) {
                            var _a;
                            // If we can't read the directory, add it to the error collection
                            ;
                            ((_a = multiError.current) !== null && _a !== void 0 ? _a : (multiError.current = new MultiError('Failed to load some guides:'))).appendError("Failed to read directory ".concat(dir, ": ").concat(extractMessageFromAnyError(error)), error);
                            return [];
                        })];
            }
        });
    });
}
/**
 * Node.js-specific loader for GuideModel instances from the filesystem.
 * This class contains all the filesystem operations that require Node.js capabilities.
 */
var GuideModelLoader = /** @class */ (function () {
    function GuideModelLoader() {
    }
    /**
     * Creates a GuideModel instance by loading and processing a markdown file from the filesystem.
     *
     * @param relPath - Relative path to the markdown file within the guides directory (e.g., "auth/users.mdx")
     * @returns A Result containing either the processed GuideModel or an error message
     *
     * @example
     * ```typescript
     * const result = await GuideModelLoader.fromFs('auth/users.mdx')
     * result.match(
     *   (guide) => console.log(guide.title, guide.subsections.length),
     *   (error) => console.error(error)
     * )
     * ```
     */
    GuideModelLoader.fromFs = function (relPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Result.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
                        var filePath, fileContent, _a, metadata, rawContent, contentWithoutFrontmatter, processedContent, finalContent, sections, subsections, title, href;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    filePath = join(GUIDES_DIRECTORY, relPath);
                                    return [4 /*yield*/, fs.readFile(filePath, 'utf-8')
                                        // Parse frontmatter using gray-matter
                                    ];
                                case 1:
                                    fileContent = _c.sent();
                                    _a = matter(fileContent), metadata = _a.data, rawContent = _a.content;
                                    contentWithoutFrontmatter = ensureFrontmatterRemoved(rawContent);
                                    return [4 /*yield*/, preprocessMdxWithDefaults(contentWithoutFrontmatter)
                                        // DOUBLE-CHECK: Ensure preprocessing didn't reintroduce frontmatter
                                        // This can happen if the preprocessing transforms introduce --- patterns
                                    ];
                                case 2:
                                    processedContent = _c.sent();
                                    finalContent = ensureFrontmatterRemoved(processedContent);
                                    return [4 /*yield*/, processMdx(finalContent)
                                        // Create subsections from the chunked sections
                                    ];
                                case 3:
                                    sections = (_c.sent()).sections;
                                    subsections = sections.map(function (section) { return ({
                                        title: section.heading,
                                        href: section.slug,
                                        content: section.content,
                                    }); });
                                    title = metadata.title || ((_b = sections.find(function (s) { return s.heading; })) === null || _b === void 0 ? void 0 : _b.heading);
                                    href = "https://www.assistance.bg/docs/guides/".concat(relPath.replace(/\.mdx?$/, ''));
                                    return [2 /*return*/, new GuideModel({
                                            title: title,
                                            href: href,
                                            content: finalContent,
                                            metadata: metadata,
                                            subsections: subsections,
                                        })];
                            }
                        });
                    }); }, function (error) {
                        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                            return new FileNotFoundError('', error);
                        }
                        return new Error("Failed to load guide from ".concat(relPath, ": ").concat(extractMessageFromAnyError(error)), {
                            cause: error,
                        });
                    })];
            });
        });
    };
    /**
     * Loads GuideModels from a list of file paths in parallel, collecting any
     * errors without stopping.
     */
    GuideModelLoader.loadGuides = function (filePaths, multiError) {
        return __awaiter(this, void 0, void 0, function () {
            var loadPromises, results, guides;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loadPromises = filePaths.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var relPath;
                            return __generator(this, function (_a) {
                                relPath = relative(GUIDES_DIRECTORY, filePath);
                                return [2 /*return*/, this.fromFs(relPath)];
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(loadPromises)];
                    case 1:
                        results = _a.sent();
                        guides = [];
                        results.forEach(function (result, index) {
                            var relPath = relative(GUIDES_DIRECTORY, filePaths[index]);
                            result.match(function (guide) { return guides.push(guide); }, function (error) {
                                var _a;
                                ;
                                ((_a = multiError.current) !== null && _a !== void 0 ? _a : (multiError.current = new MultiError('Failed to load some guides:'))).appendError("Failed to load ".concat(relPath, ": ").concat(extractMessageFromAnyError(error)), error);
                            });
                        });
                        return [2 /*return*/, guides];
                }
            });
        });
    };
    /**
     * Loads all guide models from the filesystem by walking the content directory.
     *
     * This method recursively walks the guides directory (or a specific section
     * subdirectory) and loads all non-hidden .mdx files.
     *
     * If errors occur while loading individual files, they are collected but
     * don't prevent other files from loading.
     *
     * @param section - Optional section name to limit walking to a specific
     * subdirectory (e.g., "database", "auth")
     * @returns A Both containing [successful GuideModels, MultiError with all
     * failures or null if no errors]
     *
     * @example
     * ```typescript
     * // Load all guides
     * const guides = (await GuideModelLoader.allFromFs()).unwrapLeft()
     *
     * // Load only database guides
     * const dbGuides = (await GuideModelLoader.allFromFs('database')).unwrapLeft()
     * ```
     */
    GuideModelLoader.allFromFs = function (section) {
        return __awaiter(this, void 0, void 0, function () {
            var searchDir, multiError, mdxFiles, guides;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchDir = section ? join(GUIDES_DIRECTORY, section) : GUIDES_DIRECTORY;
                        multiError = { current: null };
                        return [4 /*yield*/, walkMdxFiles(searchDir, multiError)
                            // Load each file and collect results
                        ];
                    case 1:
                        mdxFiles = _a.sent();
                        return [4 /*yield*/, this.loadGuides(mdxFiles, multiError)];
                    case 2:
                        guides = _a.sent();
                        return [2 /*return*/, new Both(guides, multiError.current)];
                }
            });
        });
    };
    return GuideModelLoader;
}());
export { GuideModelLoader };
