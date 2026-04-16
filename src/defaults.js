/**
 * Default options for UniversalPicker.
 * @module defaults
 */

export var DEFAULTS = {
    // Mode: 'default' | 'custom' | 'doubledate'
    mode: 'default',

    // Start and end date
    startDate: null,
    endDate: null,

    // Min and max selectable dates
    minDate: null,
    maxDate: null,

    // Single date picker (no range)
    singleDatePicker: false,

    // Show dropdowns for month/year selection
    showDropdowns: false,

    // Number of calendars to show (1 or 2)
    showCalendars: 2,

    // Date format for the input
    format: 'DD/MM/YYYY',

    // Separator between start and end date in input
    separator: ' - ',

    // Auto apply on selection (no Apply button needed)
    autoApply: false,

    // Show week numbers
    showWeekNumbers: false,

    // First day of week (0 = Sunday, 1 = Monday)
    firstDay: 0,

    // Linked calendars (navigating one navigates both)
    linkedCalendars: true,

    // Open direction: 'left', 'right', 'center', 'auto'
    opens: 'auto',

    // Drop direction: 'down', 'up', 'auto'
    drops: 'auto',

    // Predefined ranges (sidebar shortcuts)
    ranges: null,

    // Custom title for the nav bar (null = auto-generate based on mode)
    title: null,

    // Accounting config for 'custom' mode
    accountingConfig: [],

    // Time picker
    timePicker: false,
    timePicker24Hour: true,
    timePickerIncrement: 1,
    timePickerSeconds: false,

    // Theme / colors
    theme: {
        primaryColor: '#2563eb',
        rangeColor: '#eff6ff',
        borderColor: '#e2e8f0',
        textColor: '#1e293b',
        bgColor: '#ffffff',
        sidebarBg: '#f8fafc',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
    },

    // Locale
    locale: {
        direction: 'ltr',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        customRangeLabel: 'Custom Range',
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        weekLabel: 'W'
    },

    // Disabled dates (function returning boolean)
    isInvalidDate: null,

    // Custom CSS classes for specific dates
    isCustomDate: null,

    // Callbacks
    onShow: null,
    onHide: null,
    onApply: null,
    onCancel: null,
    onChange: null,
    onSelect: null
};
