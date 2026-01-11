var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import enabledFeaturesRaw from './enabled-features.json' with { type: 'json' };
var enabledFeaturesStaticObj = enabledFeaturesRaw;
var disabledFeaturesStaticArray = Object.entries(enabledFeaturesStaticObj)
    .filter(function (_a) {
    var _ = _a[0], value = _a[1];
    return !value;
})
    .map(function (_a) {
    var key = _a[0];
    return key;
});
function checkFeature(feature, features) {
    return !features.has(feature);
}
function featureToCamelCase(feature) {
    return feature
        .replace(/:/g, '_')
        .split('_')
        .map(function (word, index) { return (index === 0 ? word : word[0].toUpperCase() + word.slice(1)); })
        .join('');
}
function isFeatureEnabled(features, runtimeDisabledFeatures) {
    try {
        // Override is used to produce a filtered version of the docs search index
        // using the same sync setup as our normal search index
        if (process.env.ENABLED_FEATURES_OVERRIDE_DISABLE_ALL === 'true') {
            if (Array.isArray(features)) {
                return Object.fromEntries(features.map(function (feature) { return [featureToCamelCase(feature), false]; }));
            }
            return false;
        }
        var disabledFeatures_1 = new Set(__spreadArray(__spreadArray([], (runtimeDisabledFeatures !== null && runtimeDisabledFeatures !== void 0 ? runtimeDisabledFeatures : []), true), disabledFeaturesStaticArray, true));
        if (Array.isArray(features)) {
            return Object.fromEntries(features.map(function (feature) { return [
                featureToCamelCase(feature),
                checkFeature(feature, disabledFeatures_1),
            ]; }));
        }
        return checkFeature(features, disabledFeatures_1);
    }
    catch (error) {
        // Fallback for server context where process might not be available
        if (Array.isArray(features)) {
            return Object.fromEntries(features.map(function (feature) { return [featureToCamelCase(feature), true]; }));
        }
        return true;
    }
}
export { isFeatureEnabled };
