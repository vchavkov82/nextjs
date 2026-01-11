// Wrapper module for payload/shared with missing functions
// This provides all payload/shared exports plus stub functions

// Re-export specific functions that are known to be exported from payload/shared
export { generateCookie, generateExpiredPayloadCookie, generatePayloadCookie, getCookieExpiration, parseCookies } from 'payload/dist/exports/shared.js';
export { getLoginOptions } from 'payload/dist/exports/shared.js';
export { addSessionToUser, removeExpiredSessions } from 'payload/dist/exports/shared.js';
export { getFromImportMap } from 'payload/dist/exports/shared.js';
export { parsePayloadComponent } from 'payload/dist/exports/shared.js';
export { defaults as collectionDefaults } from 'payload/dist/exports/shared.js';
export { serverProps } from 'payload/dist/exports/shared.js';
export { defaultTimezones } from 'payload/dist/exports/shared.js';
export { fieldAffectsData, fieldHasMaxDepth, fieldHasSubFields, fieldIsArrayType, fieldIsBlockType, fieldIsGroupType, fieldIsHiddenOrDisabled, fieldIsID, fieldIsLocalized, fieldIsPresentationalOnly, fieldIsSidebar, fieldIsVirtual, fieldShouldBeLocalized, fieldSupportsMany, groupHasName, optionIsObject, optionIsValue, optionsAreObjects, tabHasName, valueIsValueWithRelation } from 'payload/dist/exports/shared.js';
export { getFieldPaths } from 'payload/dist/exports/shared.js';
export { formatFilesize } from 'payload/dist/exports/shared.js';
export { isImage } from 'payload/dist/exports/shared.js';
export { combineWhereConstraints } from 'payload/dist/exports/shared.js';
export { deepCopyObject, deepCopyObjectComplex, deepCopyObjectSimple, deepCopyObjectSimpleWithoutReactComponents } from 'payload/dist/exports/shared.js';
export { deepMerge, deepMergeWithCombinedArrays, deepMergeWithReactComponents, deepMergeWithSourceArrays } from 'payload/dist/exports/shared.js';
export { extractID } from 'payload/dist/exports/shared.js';
export { fieldSchemaToJSON } from 'payload/dist/exports/shared.js';
export { flattenAllFields } from 'payload/dist/exports/shared.js';
export { flattenTopLevelFields } from 'payload/dist/exports/shared.js';
export { formatAdminURL } from 'payload/dist/exports/shared.js';
export { formatLabels, toWords } from 'payload/dist/exports/shared.js';
export { getBestFitFromSizes } from 'payload/dist/exports/shared.js';
export { getDataByPath } from 'payload/dist/exports/shared.js';
export { getFieldPermissions } from 'payload/dist/exports/shared.js';
export { getSafeRedirect } from 'payload/dist/exports/shared.js';
export { getSelectMode } from 'payload/dist/exports/shared.js';
export { getSiblingData } from 'payload/dist/exports/shared.js';
export { getUniqueListBy } from 'payload/dist/exports/shared.js';
export { isNextBuild } from 'payload/dist/exports/shared.js';
export { isNumber } from 'payload/dist/exports/shared.js';
export { isPlainObject } from 'payload/dist/exports/shared.js';
export { isReactClientComponent, isReactComponentOrFunction, isReactServerComponentOrFunction } from 'payload/dist/exports/shared.js';
export { hoistQueryParamsToAnd, mergeListSearchAndWhere } from 'payload/dist/exports/shared.js';
export { reduceFieldsToValues } from 'payload/dist/exports/shared.js';
export { sanitizeUserDataForEmail } from 'payload/dist/exports/shared.js';
export { setsAreEqual } from 'payload/dist/exports/shared.js';
export { toKebabCase } from 'payload/dist/exports/shared.js';
export { transformColumnsToPreferences, transformColumnsToSearchParams } from 'payload/dist/exports/shared.js';
export { transformWhereQuery } from 'payload/dist/exports/shared.js';
export { unflatten } from 'payload/dist/exports/shared.js';
export { validateMimeType } from 'payload/dist/exports/shared.js';
export { validateWhereQuery } from 'payload/dist/exports/shared.js';
export { wait } from 'payload/dist/exports/shared.js';
export { wordBoundariesRegex } from 'payload/dist/exports/shared.js';
export { versionDefaults } from 'payload/dist/exports/shared.js';
export { deepMergeSimple } from '@payloadcms/translations/utilities';

// Stub functions that don't exist in payload 3.52.0
export function genImportMapIterateFields() {
  return []
}