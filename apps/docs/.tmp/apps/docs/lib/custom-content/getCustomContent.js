import customContentRaw from './custom-content.json' with { type: 'json' };
var customContentStaticObj = customContentRaw;
function contentToCamelCase(feature) {
    return feature
        .replace(/:/g, '_')
        .split('_')
        .map(function (word, index) { return (index === 0 ? word : word[0].toUpperCase() + word.slice(1)); })
        .join('');
}
export var getCustomContent = function (contents) {
    return Object.fromEntries(contents.map(function (content) { return [contentToCamelCase(content), customContentStaticObj[content]]; }));
};
