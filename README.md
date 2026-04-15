# UniversalPicker.js

[![npm version](https://img.shields.io/npm/v/@farisulhaq/universal-picker.svg)](https://www.npmjs.com/package/@farisulhaq/universal-picker)
[![license](https://img.shields.io/npm/l/@farisulhaq/universal-picker.svg)](https://github.com/farisulhaq/universal-picker/blob/master/LICENSE)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@farisulhaq/universal-picker)](https://bundlephobia.com/package/@farisulhaq/universal-picker)

A lightweight, zero-dependency date range picker library for the web. Supports calendar, accounting period, and double-date modes. Designed for CDN usage with UMD module support.

**[Live Demo & Playground](https://farisulhaq.github.io/universal-picker/)**

## Features

- **3 Modes**: Default (calendar), Custom (accounting periods), DoubleDate
- **Date Range Selection**: Single date or date range with visual preview on hover
- **Predefined Ranges**: Configurable sidebar shortcuts (Today, Last 7 Days, etc.)
- **Min/Max Dates**: Restrict selectable date range
- **Disabled Dates**: Custom function to disable specific dates
- **Month/Year Dropdowns**: Optional dropdown selectors for quick navigation
- **Week Numbers**: Optional ISO week number column
- **Locale Support**: Fully customizable month names, day names, labels
- **Theming**: Customize colors, fonts, and appearance
- **Responsive**: Adapts to mobile screens automatically
- **Auto-positioning**: Smart positioning relative to viewport
- **Programmatic API**: Full control via JavaScript methods
- **Events & Callbacks**: `onShow`, `onHide`, `onApply`, `onCancel`, `onChange`, `onSelect`
- **CDN Ready**: UMD module (works with `<script>`, AMD, CommonJS)
- **Zero Dependencies**: No jQuery, no external libraries

## Installation

### CDN (Recommended)

**jsDelivr:**
```html
<script src="https://cdn.jsdelivr.net/npm/@farisulhaq/universal-picker@2.0.2/UniversalPicker.min.js"></script>
```

**unpkg:**
```html
<script src="https://unpkg.com/@farisulhaq/universal-picker@2.0.2/UniversalPicker.min.js"></script>
```

### NPM

```bash
npm install @farisulhaq/universal-picker
```

```js
// CommonJS
const UniversalPicker = require('@farisulhaq/universal-picker');

// ES Module
import UniversalPicker from '@farisulhaq/universal-picker';
```

### Local

```html
<script src="path/to/UniversalPicker.js"></script>
```

## Quick Start

### Basic Date Range Picker

```html
<input type="text" id="daterange" placeholder="Select date range" />

<script src="UniversalPicker.js"></script>
<script>
  var picker = new UniversalPicker('#daterange');
</script>
```

### Single Date Picker

```html
<input type="text" id="single" placeholder="Select a date" />

<script>
  var picker = new UniversalPicker('#single', {
    singleDatePicker: true,
    autoApply: true
  });
</script>
```

### With Predefined Ranges

```html
<input type="text" id="report-date" placeholder="Select range" />

<script>
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var picker = new UniversalPicker('#report-date', {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: today,
    ranges: {
      'Today': [today, today],
      'Yesterday': [
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      ],
      'Last 7 Days': [
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
        today
      ],
      'Last 30 Days': [
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29),
        today
      ],
      'This Month': [
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 0)
      ],
      'Last Month': [
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0)
      ]
    },
    onApply: function (data) {
      console.log('Selected:', data.startDate, 'to', data.endDate);
    }
  });
</script>
```

### Accounting Period Mode

```html
<input type="text" id="accounting" placeholder="Select period" />

<script>
  var picker = new UniversalPicker('#accounting', {
    mode: 'custom',
    showCalendars: 2,
    accountingConfig: [
      { label: 'Period 1', start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
      { label: 'Period 2', start: new Date(2026, 1, 1), end: new Date(2026, 1, 28) },
      { label: 'Period 3', start: new Date(2026, 2, 1), end: new Date(2026, 2, 31) },
      { label: 'Period 4', start: new Date(2026, 3, 1), end: new Date(2026, 3, 30) },
      { label: 'Period 5', start: new Date(2026, 4, 1), end: new Date(2026, 4, 31) },
      { label: 'Period 6', start: new Date(2026, 5, 1), end: new Date(2026, 5, 30) }
    ]
  });
</script>
```

### Accounting Mode with Sidebar Ranges

You can combine accounting periods with predefined sidebar ranges. Clicking a predefined range shows a standard calendar with the range highlighted. Clicking "Custom Range" switches back to the accounting period view.

```html
<input type="text" id="accounting-ranges" placeholder="Select period" />

<script>
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var picker = new UniversalPicker('#accounting-ranges', {
    mode: 'custom',
    showCalendars: 2,
    accountingConfig: [
      { label: 'Period 1', start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
      { label: 'Period 2', start: new Date(2026, 1, 1), end: new Date(2026, 1, 28) }
    ],
    ranges: {
      'Today': [today, today],
      'This Month': [
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 0)
      ]
    },
    locale: {
      customRangeLabel: 'Select Period' // Label for switching back to accounting view
    }
  });
</script>
```

### DoubleDate Mode

Displays a grid of 12 "double dates" (1/1, 2/2, 3/3, ... 12/12) for the selected year.

```html
<input type="text" id="doubledate" placeholder="Select double date" />

<script>
  var picker = new UniversalPicker('#doubledate', {
    mode: 'doubledate',
    autoApply: true,
    onApply: function (data) {
      console.log('Double date:', data.startDate);
    }
  });
</script>
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `mode` | `string` | `'default'` | Picker mode: `'default'`, `'custom'`, or `'doubledate'` |
| `startDate` | `Date\|string` | `null` | Initial start date |
| `endDate` | `Date\|string` | `null` | Initial end date |
| `minDate` | `Date\|string` | `null` | Minimum selectable date |
| `maxDate` | `Date\|string` | `null` | Maximum selectable date |
| `singleDatePicker` | `boolean` | `false` | Select a single date instead of a range |
| `showDropdowns` | `boolean` | `false` | Show month/year dropdown selectors |
| `showCalendars` | `number` | `2` | Number of calendar months to display (1 or 2) |
| `format` | `string` | `'DD/MM/YYYY'` | Date format for the input. Tokens: `DD`, `MM`, `MMM`, `MMMM`, `YYYY` |
| `separator` | `string` | `' - '` | Separator between start and end date in the input |
| `autoApply` | `boolean` | `false` | Automatically apply selection (hides Apply/Cancel buttons) |
| `showWeekNumbers` | `boolean` | `false` | Show ISO week numbers column |
| `firstDay` | `number` | `0` | First day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) |
| `linkedCalendars` | `boolean` | `true` | Navigating one calendar navigates both |
| `opens` | `string` | `'auto'` | Open direction: `'left'`, `'right'`, `'center'`, `'auto'` |
| `drops` | `string` | `'auto'` | Drop direction: `'up'`, `'down'`, `'auto'` |
| `ranges` | `object` | `null` | Predefined ranges for the sidebar (see example above) |
| `accountingConfig` | `array` | `[]` | Accounting period configuration for `'custom'` mode |
| `theme` | `object` | *(see below)* | Theme/color customization |
| `locale` | `object` | *(see below)* | Locale/language customization |
| `isInvalidDate` | `function` | `null` | Function `(date) => boolean` to disable specific dates |
| `isCustomDate` | `function` | `null` | Function `(date) => string\|string[]` to add custom CSS classes |

### Theme Options

```js
{
  primaryColor: '#2563eb',
  rangeColor: '#eff6ff',
  borderColor: '#e2e8f0',
  textColor: '#1e293b',
  bgColor: '#ffffff',
  sidebarBg: '#f8fafc',
  fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
}
```

### Locale Options

```js
{
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
}
```

#### Indonesian Locale Example

```js
var picker = new UniversalPicker('#tanggal', {
  format: 'DD MMM YYYY',
  firstDay: 1,
  locale: {
    applyLabel: 'Terapkan',
    cancelLabel: 'Batal',
    customRangeLabel: 'Rentang Kustom',
    monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    dayNamesShort: ['Mi', 'Se', 'Se', 'Ra', 'Ka', 'Ju', 'Sa']
  }
});
```

## Callbacks

All callbacks receive a `data` object with `startDate` and `endDate` properties.

```js
var picker = new UniversalPicker('#mydate', {
  onShow: function (data) {
    console.log('Picker opened');
  },
  onHide: function (data) {
    console.log('Picker closed');
  },
  onApply: function (data) {
    console.log('Applied:', data.startDate, 'to', data.endDate);
  },
  onCancel: function (data) {
    console.log('Cancelled');
  },
  onChange: function (data) {
    console.log('Changed:', data.startDate, 'to', data.endDate);
  },
  onSelect: function (data) {
    console.log('Date clicked:', data.startDate);
  }
});
```

## DOM Events

You can also listen for events on the input element using standard DOM event listeners:

```js
var input = document.getElementById('mydate');

input.addEventListener('up.apply', function (e) {
  console.log('Applied:', e.detail.startDate, 'to', e.detail.endDate);
});

input.addEventListener('up.change', function (e) {
  console.log('Changed:', e.detail);
});

input.addEventListener('up.show', function () {
  console.log('Picker shown');
});

input.addEventListener('up.hide', function () {
  console.log('Picker hidden');
});
```

## Methods

### `show()`
Open the picker programmatically.

```js
picker.show();
```

### `hide()`
Close the picker.

```js
picker.hide();
```

### `toggle()`
Toggle picker visibility.

```js
picker.toggle();
```

### `apply()`
Apply the current selection and close.

```js
picker.apply();
```

### `cancel()`
Revert to previous selection and close.

```js
picker.cancel();
```

### `setDateRange(startDate, endDate)`
Set the date range programmatically.

```js
picker.setDateRange(new Date(2026, 0, 1), new Date(2026, 0, 31));
```

### `setStartDate(date)`
Set only the start date.

```js
picker.setStartDate(new Date(2026, 5, 1));
```

### `setEndDate(date)`
Set only the end date.

```js
picker.setEndDate(new Date(2026, 5, 30));
```

### `getDateRange()`
Get the current selection.

```js
var range = picker.getDateRange();
console.log(range.startDate, range.endDate);
```

### `setMinDate(date)`
Set the minimum selectable date.

```js
picker.setMinDate(new Date(2026, 0, 1));
```

### `setMaxDate(date)`
Set the maximum selectable date.

```js
picker.setMaxDate(new Date(2026, 11, 31));
```

### `updateOptions(options)`
Update options dynamically.

```js
picker.updateOptions({
  singleDatePicker: true,
  format: 'DD MMM YYYY'
});
```

### `destroy()`
Remove the picker and clean up all event listeners.

```js
picker.destroy();
```

### `UniversalPicker.getInstance(element)`
Get the picker instance attached to an element.

```js
var picker = UniversalPicker.getInstance('#mydate');
```

## Disabling Specific Dates

```js
var picker = new UniversalPicker('#mydate', {
  isInvalidDate: function (date) {
    // Disable weekends
    var day = date.getDay();
    return day === 0 || day === 6;
  }
});
```

## Custom CSS Classes on Dates

```js
var picker = new UniversalPicker('#mydate', {
  isCustomDate: function (date) {
    // Add a class to holidays
    var holidays = ['2026-01-01', '2026-12-25'];
    var dateStr = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    if (holidays.indexOf(dateStr) !== -1) {
      return 'holiday';
    }
    return null;
  }
});
```

Then style it:

```css
.up-day.holiday {
  background: #fef2f2;
  color: #dc2626;
  font-weight: bold;
}
```

## Multiple Instances

Each picker is fully independent. You can create as many as needed:

```html
<input type="text" id="start" placeholder="Start date" />
<input type="text" id="end" placeholder="End date" />

<script>
  var startPicker = new UniversalPicker('#start', { singleDatePicker: true, autoApply: true });
  var endPicker = new UniversalPicker('#end', { singleDatePicker: true, autoApply: true });
</script>
```

## Full Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UniversalPicker Demo</title>
  <style>
    body { font-family: 'Inter', sans-serif; padding: 40px; background: #f9fafb; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
    input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; width: 320px; }
  </style>
</head>
<body>

  <div class="form-group">
    <label>Date Range</label>
    <input type="text" id="daterange" placeholder="Select date range" />
  </div>

  <div class="form-group">
    <label>Single Date</label>
    <input type="text" id="singledate" placeholder="Pick a date" />
  </div>

  <div class="form-group">
    <label>Double Date</label>
    <input type="text" id="doubledate" placeholder="Select double date" />
  </div>

  <script src="UniversalPicker.js"></script>
  <script>
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Date Range Picker with sidebar
    var rangePicker = new UniversalPicker('#daterange', {
      format: 'DD MMM YYYY',
      showDropdowns: true,
      showWeekNumbers: true,
      ranges: {
        'Today': [today, today],
        'Last 7 Days': [
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
          today
        ],
        'This Month': [
          new Date(today.getFullYear(), today.getMonth(), 1),
          new Date(today.getFullYear(), today.getMonth() + 1, 0)
        ]
      },
      onApply: function (data) {
        console.log('Range:', data.startDate, '-', data.endDate);
      }
    });

    // Single Date Picker
    var singlePicker = new UniversalPicker('#singledate', {
      singleDatePicker: true,
      autoApply: true,
      format: 'DD MMMM YYYY',
      showDropdowns: true,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31)
    });

    // Double Date Picker
    var ddPicker = new UniversalPicker('#doubledate', {
      mode: 'doubledate',
      autoApply: true,
      format: 'DD/MM/YYYY'
    });
  </script>

</body>
</html>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Opera 47+

## Links

- **GitHub**: https://github.com/farisulhaq/universal-picker
- **npm**: https://www.npmjs.com/package/@farisulhaq/universal-picker
- **CDN (jsDelivr)**: https://cdn.jsdelivr.net/npm/@farisulhaq/universal-picker@2.0.2/UniversalPicker.min.js
- **CDN (unpkg)**: https://unpkg.com/@farisulhaq/universal-picker@2.0.2/UniversalPicker.min.js

## License

MIT License. Free for personal and commercial use. See [LICENSE](./LICENSE).
