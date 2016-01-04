// various utility functions
var _ = require('lodash');

var Utils = {};

/**
 * regexFilter: Return regex function for use in filter.
 *
 * The function returned returns true if the query pattern is contained
 * in the element given to it. Case insensitive.
 *
 * @param {string} pattern - The query pattern.
 * @returns {Function} - The query function.
 */
Utils.regexFilter = function(pattern) {
    return function(element) {
        return element.match(new RegExp(pattern, 'i'));
    };
};

/**
 * uniqueData: Return all unique data values.
 *
 * Given an array of objects, find all unique values for a specified key.
 * Uses lodash chained lodash methods.
 *
 * @param {array} data - An array of objects.
 * @param {string} field - The key to find the unique values of.
 * @returns {array} - An array of unique values.
 */
Utils.uniqueData = function(data, field) {
    return _.uniq(_.pluck(_.flatten(data), field)).sort();
};

/**
 * findByValues: Filter an array of objects on multiple values of a property.
 *
 * @param {array} collection - An array of objects.
 * @param {string} property - The object property to filter on.
 * @param {array} values - An array of values to filter the data.
 */
Utils.findByValues = function(collection, property, values) {
    return _.filter(collection, function(item) {
        return _.contains(values, item[property]);
    });
};

/**
 * sortedPush: Insert an item into an array while preserving the ordering.
 *
 * @param {array} array - A sorted array of primitives.
 * @param {string, number} value - A value to insert into the array.
 */
Utils.sortedPush = function(array, value) {
    array.splice(_.sortedIndex(array, value), 0, value);
};

/**
 * makeSelector: Add '#' before input string. Makes item selectable in jQuery.
 *
 * Returns input element if it already begins with #.
 *
 * @param {string} element
 */
Utils.makeSelector = function(element) {
    return element.charAt(0) === '#' ? element : '#' + element;
};

module.exports = Utils;
