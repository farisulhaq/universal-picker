/**
 * UniversalPicker core class.
 * @module core
 */

import { Utils } from './utils.js';
import { DEFAULTS } from './defaults.js';
import { injectStyles } from './styles.js';

// ─── Constructor ───────────────────────────────────────────────────
function UniversalPicker(element, options) {
    if (!(this instanceof UniversalPicker)) {
        return new UniversalPicker(element, options);
    }

    if (typeof element === 'string') {
        this.element = document.getElementById(element) || document.querySelector(element);
    } else {
        this.element = element;
    }

    if (!this.element) {
        console.error('[UniversalPicker] Element not found.');
        return;
    }

    if (this.element._universalPicker) {
        this.element._universalPicker.destroy();
    }
    this.element._universalPicker = this;

    this.options = Utils.deepMerge(DEFAULTS, options || {});
    this.id = Utils.uid('up');
    this.isShowing = false;
    this._destroyed = false;

    this.startDate = this.options.startDate ? new Date(this.options.startDate) : null;
    this.endDate = this.options.endDate ? new Date(this.options.endDate) : null;
    this.minDate = this.options.minDate ? new Date(this.options.minDate) : null;
    this.maxDate = this.options.maxDate ? new Date(this.options.maxDate) : null;

    this._prevStartDate = Utils.cloneDate(this.startDate);
    this._prevEndDate = Utils.cloneDate(this.endDate);

    var now = new Date();
    if (this.startDate) {
        this.viewYear = this.startDate.getFullYear();
        this.viewMonth = this.startDate.getMonth();
    } else {
        this.viewYear = now.getFullYear();
        this.viewMonth = now.getMonth();
    }
    this.viewIdx = 0;
    this.activeRange = null;
    this.hoverDate = null;

    injectStyles(this.options.theme);
    this._build();
    this._bindEvents();

    if (this.startDate) {
        this._updateInputValue();
    }
}

// ─── Build DOM ─────────────────────────────────────────────────────
UniversalPicker.prototype._build = function () {
    var opts = this.options;
    var locale = opts.locale;
    var hasSidebar = opts.ranges && Object.keys(opts.ranges).length > 0;
    this._hasSidebar = hasSidebar;

    var container = document.createElement('div');
    container.id = this.id;
    container.className = 'up-picker' + (hasSidebar ? ' up-has-sidebar' : '');
    container.setAttribute('data-mode', opts.mode);

    var html = '';

    if (hasSidebar) {
        html += '<div class="up-sidebar">';
        var ranges = opts.ranges;
        for (var key in ranges) {
            if (ranges.hasOwnProperty(key)) {
                html += '<div class="up-sidebar-item" data-range-key="' + this._escapeHtml(key) + '">' + this._escapeHtml(key) + '</div>';
            }
        }
        html += '<div class="up-sidebar-item active" data-range-key="__custom__">' + this._escapeHtml(locale.customRangeLabel) + '</div>';
        html += '</div>';
    }

    html += '<div class="up-main">';
    html += '<div class="up-nav">';
    html += '<button type="button" class="up-btn-nav up-prev" aria-label="Previous">&#10094;</button>';
    html += '<span class="up-nav-title"></span>';
    html += '<button type="button" class="up-btn-nav up-next" aria-label="Next">&#10095;</button>';
    html += '</div>';
    html += '<div class="up-content">';
    html += '<div class="up-panes"></div>';
    html += '<div class="up-doubledate-grid" style="display:none"></div>';
    html += '</div>';

    if (!opts.autoApply) {
        html += '<div class="up-footer">';
        html += '<div class="up-footer-info"></div>';
        html += '<div class="up-footer-actions">';
        html += '<button type="button" class="up-btn up-btn-cancel">' + this._escapeHtml(locale.cancelLabel) + '</button>';
        html += '<button type="button" class="up-btn up-btn-apply">' + this._escapeHtml(locale.applyLabel) + '</button>';
        html += '</div>';
        html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
    document.body.appendChild(container);
    this.container = container;

    this.activeRange = '__custom__';
    this._showCalendar = true;
};

// ─── Bind Events ───────────────────────────────────────────────────
UniversalPicker.prototype._bindEvents = function () {
    var self = this;
    var ns = this.id;

    var showHandler = function (e) {
        e.stopPropagation();
        if (!self.isShowing) {
            self.show();
        }
    };
    Utils.on(this.element, 'click', showHandler, ns);
    Utils.on(this.element, 'focus', showHandler, ns);

    if (this.element.tagName === 'INPUT') {
        this.element.setAttribute('readonly', 'readonly');
    }

    var prevBtn = this.container.querySelector('.up-prev');
    var nextBtn = this.container.querySelector('.up-next');

    Utils.on(prevBtn, 'click', function (e) {
        e.stopPropagation();
        self._navigate(-1);
    }, ns);

    Utils.on(nextBtn, 'click', function (e) {
        e.stopPropagation();
        self._navigate(1);
    }, ns);

    var applyBtn = this.container.querySelector('.up-btn-apply');
    if (applyBtn) {
        Utils.on(applyBtn, 'click', function (e) {
            e.stopPropagation();
            self.apply();
        }, ns);
    }

    var cancelBtn = this.container.querySelector('.up-btn-cancel');
    if (cancelBtn) {
        Utils.on(cancelBtn, 'click', function (e) {
            e.stopPropagation();
            self.cancel();
        }, ns);
    }

    var sidebarItems = this.container.querySelectorAll('.up-sidebar-item');
    for (var i = 0; i < sidebarItems.length; i++) {
        (function (item) {
            Utils.on(item, 'click', function (e) {
                e.stopPropagation();
                self._handleSidebarClick(item.getAttribute('data-range-key'));
            }, ns);
        })(sidebarItems[i]);
    }

    Utils.on(document, 'click', function (e) {
        if (self.isShowing && !self.container.contains(e.target) && e.target !== self.element) {
            self.hide();
        }
    }, ns);

    Utils.on(document, 'keydown', function (e) {
        if (e.key === 'Escape' && self.isShowing) {
            self.cancel();
        }
    }, ns);

    Utils.on(this.container, 'click', function (e) {
        e.stopPropagation();
    }, ns);

    var panesEl = this.container.querySelector('.up-panes');
    if (panesEl) {
        Utils.on(panesEl, 'mouseleave', function () {
            if (self.hoverDate) {
                self.hoverDate = null;
                self._updateHoverPreview();
            }
        }, ns);
    }
};

// ─── Navigation ────────────────────────────────────────────────────
UniversalPicker.prototype._navigate = function (step) {
    var mode = this.options.mode;

    if (mode === 'doubledate') {
        this.viewYear += step;
    } else if (mode === 'custom' && this.activeRange === '__custom__') {
        var nextIdx = this.viewIdx + (step * this.options.showCalendars);
        if (nextIdx >= 0 && nextIdx < this.options.accountingConfig.length) {
            this.viewIdx = nextIdx;
        }
    } else {
        this.viewMonth += step;
        if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
        if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
    }
    this._render();
};

// ─── Sidebar Click ─────────────────────────────────────────────────
UniversalPicker.prototype._handleSidebarClick = function (key) {
    var items = this.container.querySelectorAll('.up-sidebar-item');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
        if (items[i].getAttribute('data-range-key') === key) {
            items[i].classList.add('active');
        }
    }

    this.activeRange = key;

    if (key === '__custom__') {
        this._showCalendar = true;
        this._render();
        return;
    }

    var ranges = this.options.ranges;
    if (ranges && ranges[key]) {
        var range = ranges[key];
        if (typeof range === 'function') { range = range(); }
        this.startDate = new Date(range[0]);
        this.endDate = new Date(range[1]);
        this.viewYear = this.startDate.getFullYear();
        this.viewMonth = this.startDate.getMonth();
        this._showCalendar = true;
        this._render();
        if (this.options.autoApply) { this.apply(); }
    }
};

// ─── Render ────────────────────────────────────────────────────────
UniversalPicker.prototype._render = function () {
    var mode = this.options.mode;
    var title = this.container.querySelector('.up-nav-title');
    var panes = this.container.querySelector('.up-panes');
    var ddGrid = this.container.querySelector('.up-doubledate-grid');
    var sidebar = this.container.querySelector('.up-sidebar');
    var nav = this.container.querySelector('.up-nav');
    var content = this.container.querySelector('.up-content');

    panes.innerHTML = '';
    ddGrid.innerHTML = '';

    if (sidebar) { sidebar.style.display = (mode === 'doubledate') ? 'none' : ''; }
    if (nav) nav.style.display = '';
    if (content) content.style.display = '';

    if (mode === 'doubledate') {
        this._renderDoubleDate(title, panes, ddGrid);
    } else if (mode === 'custom') {
        this._renderCustom(title, panes, ddGrid);
    } else {
        this._renderDefault(title, panes, ddGrid);
    }

    this._updateFooterInfo();
    this._updateApplyState();
};

// ─── Render Default ────────────────────────────────────────────────
UniversalPicker.prototype._renderDefault = function (titleEl, panesEl, ddGridEl) {
    var opts = this.options;
    var locale = opts.locale;
    panesEl.style.display = 'flex';
    ddGridEl.style.display = 'none';

    var calendars = opts.showCalendars;
    var parts = [];
    for (var i = 0; i < calendars; i++) {
        var m = this.viewMonth + i, y = this.viewYear;
        if (m > 11) { m -= 12; y++; }
        parts.push(locale.monthNames[m] + ' ' + y);
    }
    titleEl.innerText = parts.join('  /  ');

    for (var i = 0; i < calendars; i++) {
        var m = this.viewMonth + i, y = this.viewYear;
        if (m > 11) { m -= 12; y++; }
        this._renderCalendarPane(panesEl, y, m);
    }
};

// ─── Render Custom (Accounting) ────────────────────────────────────
UniversalPicker.prototype._renderCustom = function (titleEl, panesEl, ddGridEl) {
    var config = this.options.accountingConfig;
    panesEl.style.display = 'flex';
    ddGridEl.style.display = 'none';

    if (this._hasSidebar && this.activeRange && this.activeRange !== '__custom__') {
        var opts = this.options;
        var locale = opts.locale;
        var calendars = opts.showCalendars;
        var parts = [];
        for (var i = 0; i < calendars; i++) {
            var m = this.viewMonth + i, y = this.viewYear;
            if (m > 11) { m -= 12; y++; }
            parts.push(locale.monthNames[m] + ' ' + y);
        }
        titleEl.innerText = parts.join('  /  ');
        for (var i = 0; i < calendars; i++) {
            var m = this.viewMonth + i, y = this.viewYear;
            if (m > 11) { m -= 12; y++; }
            this._renderCalendarPane(panesEl, y, m);
        }
        return;
    }

    titleEl.innerText = 'ACCOUNTING ' + this.viewYear;
    var count = this.options.showCalendars;
    for (var i = 0; i < count; i++) {
        var idx = this.viewIdx + i;
        if (config[idx]) { this._renderAccountingPane(panesEl, config[idx]); }
    }
};

// ─── Render DoubleDate ─────────────────────────────────────────────
UniversalPicker.prototype._renderDoubleDate = function (titleEl, panesEl, ddGridEl) {
    var self = this;
    panesEl.style.display = 'none';
    ddGridEl.style.display = 'grid';
    titleEl.innerText = 'DOUBLE DATE ' + this.viewYear;

    for (var i = 1; i <= 12; i++) {
        (function (month) {
            var btn = document.createElement('div');
            btn.className = 'up-dd-item';
            btn.innerText = month + '/' + month;
            var d = new Date(self.viewYear, month - 1, month);
            if (self.startDate && Utils.isSameDay(d, self.startDate)) {
                btn.classList.add('up-dd-selected');
            }
            btn.onclick = function (e) {
                e.stopPropagation();
                self.startDate = d;
                self.endDate = new Date(d);
                self._render();
                if (self.options.autoApply) { self.apply(); }
            };
            ddGridEl.appendChild(btn);
        })(i);
    }
};

// ─── Render Calendar Pane ──────────────────────────────────────────
UniversalPicker.prototype._renderCalendarPane = function (container, year, month) {
    var self = this;
    var opts = this.options;
    var locale = opts.locale;

    var box = document.createElement('div');
    box.className = 'up-month-box';

    if (opts.showDropdowns) {
        box.appendChild(this._createDropdowns(year, month));
    } else {
        var titleDiv = document.createElement('div');
        titleDiv.className = 'up-month-title';
        titleDiv.innerText = locale.monthNames[month] + ' ' + year;
        box.appendChild(titleDiv);
    }

    var grid = document.createElement('div');
    grid.className = 'up-grid' + (opts.showWeekNumbers ? ' up-has-weeknum' : '');

    if (opts.showWeekNumbers) {
        var wnHead = document.createElement('div');
        wnHead.className = 'up-head';
        wnHead.innerText = locale.weekLabel;
        grid.appendChild(wnHead);
    }

    var firstDay = opts.firstDay;
    for (var i = 0; i < 7; i++) {
        var dayIdx = (firstDay + i) % 7;
        var hd = document.createElement('div');
        hd.className = 'up-head';
        hd.innerText = locale.dayNamesShort[dayIdx];
        grid.appendChild(hd);
    }

    var firstOfMonth = new Date(year, month, 1);
    var startDay = firstOfMonth.getDay();
    var offset = (startDay - firstDay + 7) % 7;
    var daysInMonth = Utils.daysInMonth(year, month);
    var prevMonthDays = Utils.daysInMonth(year, month - 1);

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var totalCells = 42;

    for (var i = 0; i < totalCells; i++) {
        if (opts.showWeekNumbers && i % 7 === 0) {
            var wnDate = (i < offset) ? new Date(year, month, 1 - offset + i) : new Date(year, month, i - offset + 1);
            var wn = document.createElement('div');
            wn.className = 'up-weeknum';
            wn.innerText = this._getWeekNumber(wnDate);
            grid.appendChild(wn);
        }

        var dayEl = document.createElement('div');
        dayEl.className = 'up-day';
        var dayDate, dayNum;

        if (i < offset) {
            dayNum = prevMonthDays - offset + i + 1;
            dayDate = new Date(year, month - 1, dayNum);
            dayEl.classList.add('up-outside');
            dayEl.innerText = dayNum;
        } else if (i - offset >= daysInMonth) {
            dayNum = i - offset - daysInMonth + 1;
            dayDate = new Date(year, month + 1, dayNum);
            dayEl.classList.add('up-outside');
            dayEl.innerText = dayNum;
        } else {
            dayNum = i - offset + 1;
            dayDate = new Date(year, month, dayNum);
            dayEl.innerText = dayNum;

            if (Utils.isSameDay(dayDate, today)) { dayEl.classList.add('up-today'); }

            var isDisabled = false;
            if (self.minDate && dayDate < self.minDate) isDisabled = true;
            if (self.maxDate && dayDate > self.maxDate) isDisabled = true;
            if (opts.isInvalidDate && typeof opts.isInvalidDate === 'function') {
                if (opts.isInvalidDate(dayDate)) isDisabled = true;
            }
            if (isDisabled) { dayEl.classList.add('up-disabled'); }

            if (opts.isCustomDate && typeof opts.isCustomDate === 'function') {
                var customClass = opts.isCustomDate(dayDate);
                if (customClass) {
                    if (typeof customClass === 'string') { dayEl.classList.add(customClass); }
                    else if (Array.isArray(customClass)) { customClass.forEach(function (c) { dayEl.classList.add(c); }); }
                }
            }

            if (self.startDate && Utils.isSameDay(dayDate, self.startDate)) {
                dayEl.classList.add('up-selected');
                if (self.endDate && !Utils.isSameDay(self.startDate, self.endDate)) { dayEl.classList.add('up-range-start'); }
            }
            if (self.endDate && Utils.isSameDay(dayDate, self.endDate)) {
                dayEl.classList.add('up-selected');
                if (self.startDate && !Utils.isSameDay(self.startDate, self.endDate)) { dayEl.classList.add('up-range-end'); }
            }
            if (Utils.isBetween(dayDate, self.startDate, self.endDate)) { dayEl.classList.add('up-in-range'); }

            if (!isDisabled) {
                (function (d) {
                    dayEl.onclick = function (e) { e.stopPropagation(); self._selectDate(d); };
                    dayEl.onmouseenter = function () {
                        if (!opts.singleDatePicker && self.startDate && !self.endDate) {
                            self.hoverDate = d;
                            self._updateHoverPreview();
                        }
                    };
                })(new Date(dayDate));
            }

            dayEl._upDate = new Date(dayDate);
        }

        grid.appendChild(dayEl);
    }

    box.appendChild(grid);
    container.appendChild(box);
};

// ─── Update Hover Preview ──────────────────────────────────────────
UniversalPicker.prototype._updateHoverPreview = function () {
    var self = this;
    var allDays = this.container.querySelectorAll('.up-day');
    var hasHover = this.startDate && !this.endDate && this.hoverDate;
    var hStart, hEnd;

    if (hasHover) {
        hStart = this.startDate;
        hEnd = this.hoverDate;
        if (hEnd < hStart) { var tmp = hStart; hStart = hEnd; hEnd = tmp; }
    }

    for (var i = 0; i < allDays.length; i++) {
        var el = allDays[i];
        var d = el._upDate;
        if (!d || el.classList.contains('up-outside') || el.classList.contains('up-disabled')) continue;
        if (el.classList.contains('up-selected')) continue;
        el.classList.remove('up-in-range');
        if (hasHover && Utils.isBetween(d, hStart, hEnd)) { el.classList.add('up-in-range'); }
    }
};

// ─── Render Accounting Pane ────────────────────────────────────────
UniversalPicker.prototype._renderAccountingPane = function (container, config) {
    var self = this;
    var box = document.createElement('div');
    box.className = 'up-month-box';

    var titleDiv = document.createElement('div');
    titleDiv.className = 'up-month-title';
    titleDiv.innerText = config.label;
    box.appendChild(titleDiv);

    var grid = document.createElement('div');
    grid.className = 'up-grid';

    var locale = this.options.locale;
    var firstDay = this.options.firstDay;

    for (var i = 0; i < 7; i++) {
        var dayIdx = (firstDay + i) % 7;
        var hd = document.createElement('div');
        hd.className = 'up-head';
        hd.innerText = locale.dayNamesShort[dayIdx];
        grid.appendChild(hd);
    }

    var start = new Date(config.start);
    var end = new Date(config.end);
    var startDay = start.getDay();
    var offset = (startDay - firstDay + 7) % 7;

    for (var i = offset - 1; i >= 0; i--) {
        var pd = new Date(start);
        pd.setDate(pd.getDate() - i - 1);
        grid.appendChild(this._createDayEl(pd.getDate(), 'up-outside'));
    }

    var curr = new Date(start);
    while (curr <= end) {
        var d = new Date(curr);
        var el = this._createDayEl(d.getDate());
        if (self.startDate && Utils.isSameDay(d, self.startDate)) el.classList.add('up-selected', 'up-range-start');
        if (self.endDate && Utils.isSameDay(d, self.endDate)) el.classList.add('up-selected', 'up-range-end');
        if (Utils.isBetween(d, self.startDate, self.endDate)) el.classList.add('up-in-range');
        (function (date) {
            el.onclick = function (e) { e.stopPropagation(); self._selectDate(date); };
        })(d);
        grid.appendChild(el);
        curr.setDate(curr.getDate() + 1);
    }

    var totalCells = grid.children.length - 7;
    var remaining = (Math.ceil(totalCells / 7) * 7) - totalCells;
    if (remaining > 0 && remaining < 7) {
        for (var i = 1; i <= remaining; i++) {
            grid.appendChild(this._createDayEl(i, 'up-outside'));
        }
    }

    box.appendChild(grid);
    container.appendChild(box);
};

// ─── Helpers ───────────────────────────────────────────────────────
UniversalPicker.prototype._createDayEl = function (text, extraClass) {
    var div = document.createElement('div');
    div.className = 'up-day' + (extraClass ? ' ' + extraClass : '');
    div.innerText = text;
    return div;
};

UniversalPicker.prototype._createDropdowns = function (year, month) {
    var self = this;
    var locale = this.options.locale;
    var row = document.createElement('div');
    row.className = 'up-dropdown-row';

    var monthSelect = document.createElement('select');
    monthSelect.className = 'up-select';
    for (var i = 0; i < 12; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerText = locale.monthNamesShort[i];
        if (i === month) opt.selected = true;
        monthSelect.appendChild(opt);
    }
    monthSelect.onchange = function () { self.viewMonth = parseInt(this.value); self._render(); };

    var yearSelect = document.createElement('select');
    yearSelect.className = 'up-select';
    var minYear = self.minDate ? self.minDate.getFullYear() : year - 10;
    var maxYear = self.maxDate ? self.maxDate.getFullYear() : year + 10;
    for (var y = minYear; y <= maxYear; y++) {
        var opt = document.createElement('option');
        opt.value = y;
        opt.innerText = y;
        if (y === year) opt.selected = true;
        yearSelect.appendChild(opt);
    }
    yearSelect.onchange = function () { self.viewYear = parseInt(this.value); self._render(); };

    row.appendChild(monthSelect);
    row.appendChild(yearSelect);
    return row;
};

UniversalPicker.prototype._selectDate = function (date) {
    if (this.options.singleDatePicker) {
        this.startDate = date;
        this.endDate = new Date(date);
        this._render();
        if (this.options.autoApply) { this.apply(); }
        this._fireEvent('select', { startDate: this.startDate, endDate: this.endDate });
        return;
    }

    if (!this.startDate || (this.startDate && this.endDate)) {
        this.startDate = date;
        this.endDate = null;
    } else {
        if (date < this.startDate) {
            this.endDate = new Date(this.startDate);
            this.startDate = date;
        } else {
            this.endDate = date;
        }
        if (this.options.autoApply) { this.apply(); }
    }

    this.hoverDate = null;
    this._render();
    this._fireEvent('select', { startDate: this.startDate, endDate: this.endDate });
};

UniversalPicker.prototype._updateFooterInfo = function () {
    var info = this.container.querySelector('.up-footer-info');
    if (!info) return;
    var locale = this.options.locale;
    var fmt = this.options.format;

    if (this.startDate && this.endDate) {
        var s = Utils.formatDate(this.startDate, fmt, locale);
        var e = Utils.formatDate(this.endDate, fmt, locale);
        info.innerText = Utils.isSameDay(this.startDate, this.endDate) ? s : s + this.options.separator + e;
    } else if (this.startDate) {
        info.innerText = Utils.formatDate(this.startDate, fmt, locale) + ' - ...';
    } else {
        info.innerText = 'Select a date range';
    }
};

UniversalPicker.prototype._updateApplyState = function () {
    var btn = this.container.querySelector('.up-btn-apply');
    if (!btn) return;
    btn.disabled = this.options.singleDatePicker ? !this.startDate : !(this.startDate && this.endDate);
};

UniversalPicker.prototype._updateInputValue = function () {
    var locale = this.options.locale;
    var fmt = this.options.format;
    var val = '';

    if (this.startDate) {
        var s = Utils.formatDate(this.startDate, fmt, locale);
        if (this.endDate && !Utils.isSameDay(this.startDate, this.endDate)) {
            val = s + this.options.separator + Utils.formatDate(this.endDate, fmt, locale);
        } else {
            val = s;
        }
    }

    if (this.element.tagName === 'INPUT') { this.element.value = val; }
    else { this.element.innerText = val; }
};

UniversalPicker.prototype._updatePosition = function () {
    var rect = this.element.getBoundingClientRect();
    var pickerRect = this.container.getBoundingClientRect();
    var opens = this.options.opens;
    var drops = this.options.drops;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    var viewportW = window.innerWidth;
    var viewportH = window.innerHeight;

    if (drops === 'auto') {
        drops = ((viewportH - rect.bottom) < pickerRect.height && rect.top > (viewportH - rect.bottom)) ? 'up' : 'down';
    }
    if (opens === 'auto') {
        opens = ((viewportW - rect.left) < pickerRect.width && rect.right > (viewportW - rect.left)) ? 'left' : 'right';
    }

    var top = (drops === 'up') ? rect.top + scrollY - pickerRect.height - 8 : rect.bottom + scrollY + 8;
    var left;
    if (opens === 'left') { left = rect.right + scrollX - pickerRect.width; }
    else if (opens === 'center') { left = rect.left + scrollX + (rect.width / 2) - (pickerRect.width / 2); }
    else { left = rect.left + scrollX; }

    left = Math.max(scrollX + 10, Math.min(left, scrollX + viewportW - pickerRect.width - 10));
    top = Math.max(scrollY + 10, top);

    this.container.style.top = top + 'px';
    this.container.style.left = left + 'px';
};

UniversalPicker.prototype._getWeekNumber = function (date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

UniversalPicker.prototype._escapeHtml = function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

UniversalPicker.prototype._fireEvent = function (name, data) {
    var callbackName = 'on' + name.charAt(0).toUpperCase() + name.slice(1);
    if (this.options[callbackName] && typeof this.options[callbackName] === 'function') {
        this.options[callbackName].call(this, data);
    }
    var event;
    try { event = new CustomEvent('up.' + name, { detail: data, bubbles: true }); }
    catch (e) { event = document.createEvent('CustomEvent'); event.initCustomEvent('up.' + name, true, true, data); }
    this.element.dispatchEvent(event);
};

// ─── Public API ────────────────────────────────────────────────────
UniversalPicker.prototype.show = function () {
    if (this._destroyed) return;
    this._prevStartDate = Utils.cloneDate(this.startDate);
    this._prevEndDate = Utils.cloneDate(this.endDate);

    if (this.startDate) {
        this.viewYear = this.startDate.getFullYear();
        this.viewMonth = this.startDate.getMonth();
    }

    if (this._hasSidebar) {
        this.activeRange = '__custom__';
        this._showCalendar = true;
        var items = this.container.querySelectorAll('.up-sidebar-item');
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
            if (items[i].getAttribute('data-range-key') === '__custom__') { items[i].classList.add('active'); }
        }
    }

    this.container.classList.add('up-show');
    this.isShowing = true;
    this._render();

    var self = this;
    requestAnimationFrame(function () { self._updatePosition(); });
    this._fireEvent('show', {});
};

UniversalPicker.prototype.hide = function () {
    if (this._destroyed) return;
    this.container.classList.remove('up-show');
    this.isShowing = false;
    this.hoverDate = null;
    this._fireEvent('hide', {});
};

UniversalPicker.prototype.apply = function () {
    if (this.startDate) {
        this._updateInputValue();
        this._fireEvent('apply', { startDate: Utils.cloneDate(this.startDate), endDate: Utils.cloneDate(this.endDate) });
        this._fireEvent('change', { startDate: Utils.cloneDate(this.startDate), endDate: Utils.cloneDate(this.endDate) });
    }
    this.hide();
};

UniversalPicker.prototype.cancel = function () {
    this.startDate = Utils.cloneDate(this._prevStartDate);
    this.endDate = Utils.cloneDate(this._prevEndDate);
    this._fireEvent('cancel', {});
    this.hide();
};

UniversalPicker.prototype.setDateRange = function (startDate, endDate) {
    this.startDate = startDate ? new Date(startDate) : null;
    this.endDate = endDate ? new Date(endDate) : (this.startDate ? new Date(this.startDate) : null);
    if (this.startDate) { this.viewYear = this.startDate.getFullYear(); this.viewMonth = this.startDate.getMonth(); }
    this._updateInputValue();
    if (this.isShowing) { this._render(); }
    this._fireEvent('change', { startDate: Utils.cloneDate(this.startDate), endDate: Utils.cloneDate(this.endDate) });
};

UniversalPicker.prototype.setStartDate = function (date) { this.setDateRange(date, this.endDate); };
UniversalPicker.prototype.setEndDate = function (date) { this.setDateRange(this.startDate, date); };

UniversalPicker.prototype.getDateRange = function () {
    return { startDate: Utils.cloneDate(this.startDate), endDate: Utils.cloneDate(this.endDate) };
};

UniversalPicker.prototype.setMinDate = function (date) {
    this.minDate = date ? new Date(date) : null;
    if (this.isShowing) this._render();
};

UniversalPicker.prototype.setMaxDate = function (date) {
    this.maxDate = date ? new Date(date) : null;
    if (this.isShowing) this._render();
};

UniversalPicker.prototype.updateOptions = function (newOptions) {
    this.options = Utils.deepMerge(this.options, newOptions);
    if (newOptions.minDate !== undefined) this.minDate = newOptions.minDate ? new Date(newOptions.minDate) : null;
    if (newOptions.maxDate !== undefined) this.maxDate = newOptions.maxDate ? new Date(newOptions.maxDate) : null;
    if (newOptions.startDate !== undefined) this.startDate = newOptions.startDate ? new Date(newOptions.startDate) : null;
    if (newOptions.endDate !== undefined) this.endDate = newOptions.endDate ? new Date(newOptions.endDate) : null;
    if (this.isShowing) this._render();
};

UniversalPicker.prototype.toggle = function () {
    if (this.isShowing) { this.hide(); } else { this.show(); }
};

UniversalPicker.prototype.destroy = function () {
    if (this._destroyed) return;
    this._destroyed = true;
    Utils.offByNamespace(this.element, this.id);
    Utils.offByNamespace(document, this.id);
    Utils.offByNamespace(this.container, this.id);
    if (this.element.tagName === 'INPUT') { this.element.removeAttribute('readonly'); }
    if (this.container && this.container.parentNode) { this.container.parentNode.removeChild(this.container); }
    delete this.element._universalPicker;
};

// ─── Static ────────────────────────────────────────────────────────
UniversalPicker.getInstance = function (element) {
    if (typeof element === 'string') { element = document.getElementById(element) || document.querySelector(element); }
    return element ? element._universalPicker || null : null;
};

export { UniversalPicker };
