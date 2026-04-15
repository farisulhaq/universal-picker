/**
 * Utility helpers for UniversalPicker.
 * @module utils
 */

var _counter = 0;

export var Utils = {
    /**
     * Generate a unique ID.
     */
    uid: function (prefix) {
        return (prefix || 'up') + '-' + (++_counter) + '-' + Math.random().toString(36).substr(2, 6);
    },

    /**
     * Format a Date object to string.
     * Supported tokens: DD, MM, MMM, MMMM, YYYY
     */
    formatDate: function (date, format, locale) {
        if (!date) return '';
        var d = new Date(date);
        var months = locale.monthNames;
        var monthsShort = locale.monthNamesShort;
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

        return format
            .replace('YYYY', d.getFullYear())
            .replace('MMMM', months[d.getMonth()])
            .replace('MMM', monthsShort[d.getMonth()])
            .replace('MM', pad(d.getMonth() + 1))
            .replace('DD', pad(d.getDate()));
    },

    /**
     * Parse a date string back to Date object.
     */
    parseDate: function (str) {
        if (!str) return null;
        if (str instanceof Date) return new Date(str);
        var d = new Date(str);
        if (!isNaN(d.getTime())) return d;
        return null;
    },

    /**
     * Check if two dates are the same day.
     */
    isSameDay: function (a, b) {
        if (!a || !b) return false;
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
    },

    /**
     * Check if date is between start and end (exclusive).
     */
    isBetween: function (date, start, end) {
        if (!date || !start || !end) return false;
        var t = date.getTime();
        return t > start.getTime() && t < end.getTime();
    },

    /**
     * Clone a date.
     */
    cloneDate: function (d) {
        return d ? new Date(d.getTime()) : null;
    },

    /**
     * Get days in a month.
     */
    daysInMonth: function (year, month) {
        return new Date(year, month + 1, 0).getDate();
    },

    /**
     * Deep merge objects.
     */
    deepMerge: function (target, source) {
        var result = {};
        var key;
        for (key in target) {
            if (target.hasOwnProperty(key)) {
                result[key] = target[key];
            }
        }
        for (key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !(source[key] instanceof Date)) {
                    result[key] = Utils.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    },

    /**
     * Add event listener with namespace support.
     */
    on: function (el, event, handler, namespace) {
        el.addEventListener(event, handler);
        if (!el._upEvents) el._upEvents = [];
        el._upEvents.push({ event: event, handler: handler, namespace: namespace });
    },

    /**
     * Remove event listeners by namespace.
     */
    offByNamespace: function (el, namespace) {
        if (!el._upEvents) return;
        el._upEvents = el._upEvents.filter(function (e) {
            if (e.namespace === namespace) {
                el.removeEventListener(e.event, e.handler);
                return false;
            }
            return true;
        });
    }
};
