var GuideModel = /** @class */ (function () {
    function GuideModel(_a) {
        var title = _a.title, href = _a.href, checksum = _a.checksum, content = _a.content, metadata = _a.metadata, subsections = _a.subsections;
        var _b;
        this.title = title;
        this.href = href;
        this.checksum = checksum;
        this.content = content;
        this.metadata = metadata;
        this.subsections = (_b = subsections === null || subsections === void 0 ? void 0 : subsections.map(function (subsection) { return new SubsectionModel(subsection); })) !== null && _b !== void 0 ? _b : [];
    }
    return GuideModel;
}());
export { GuideModel };
var SubsectionModel = /** @class */ (function () {
    function SubsectionModel(_a) {
        var title = _a.title, href = _a.href, content = _a.content;
        this.title = title;
        this.href = href;
        this.content = content;
    }
    return SubsectionModel;
}());
export { SubsectionModel };
