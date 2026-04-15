/**
 * UniversalPicker.js - Full Professional Version
 * Includes: Default, Custom (Accounting), and DoubleDate modes.
 * Features: Date Padding, Presicion Centered Layout, and Multi-instance Support.
 */

class UniversalPicker {
    constructor(elementId, options = {}) {
        this.input = document.getElementById(elementId);
        if (!this.input) return;

        this.pickerId = `gp-picker-${elementId}`;
        this.mode = options.mode || 'default'; // 'default', 'custom', 'doubledate'
        this.accountingConfig = options.accountingConfig || [];
        this.primaryColor = options.primaryColor || '#2563eb';
        
        this.start = null;
        this.end = null;
        this.viewYear = 2026;
        this.viewMonth = new Date().getMonth();
        this.viewIdx = 0;

        this._injectStyles();
        this._buildHTML();
        this._initEvents();
    }

    _injectStyles() {
        if (document.getElementById('gp-picker-styles')) return;
        const style = document.createElement('style');
        style.id = 'gp-picker-styles';
        style.innerHTML = `
            :root { --gp-primary: ${this.primaryColor}; --gp-range: #eff6ff; --gp-border: #e2e8f0; --gp-text: #1e293b; }
            .gp-picker { 
                position: absolute; display: none; background: white; 
                border: 1px solid var(--gp-border); border-radius: 12px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 99999; 
                font-family: 'Inter', system-ui, sans-serif; user-select: none;
            }
            .gp-picker.show { display: flex; }
            .gp-sidebar { padding: 12px; border-right: 1px solid var(--gp-border); display: flex; flex-direction: column; min-width: 160px; background: #f8fafc; }
            .gp-menu-item { padding: 10px 14px; font-size: 13px; border-radius: 6px; cursor: pointer; color: var(--gp-text); transition: all 0.2s; }
            .gp-menu-item:hover { background: var(--gp-range); }
            .gp-menu-item.active { background: var(--gp-primary); color: white; }
            
            .gp-main { display: flex; flex-direction: column; width: 520px; background: white; }
            .gp-nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid var(--gp-border); }
            .nav-title { font-weight: 800; font-size: 15px; color: var(--gp-primary); letter-spacing: -0.01em; }
            .btn-nav { background: white; border: 1px solid var(--gp-border); border-radius: 6px; cursor: pointer; padding: 5px 12px; font-size: 12px; transition: 0.2s; }
            .btn-nav:hover { background: #f1f5f9; }

            .gp-panes { display: flex; justify-content: center; gap: 24px; padding: 20px; }
            .gp-month-box { width: 224px; }
            .gp-month-title { text-align: center; font-weight: 700; font-size: 13px; margin-bottom: 15px; color: #64748b; text-transform: uppercase; }
            
            .gp-grid { display: grid; grid-template-columns: repeat(7, 32px); gap: 0; }
            .gp-head { text-align: center; font-size: 11px; color: #94a3b8; font-weight: bold; height: 32px; display: flex; align-items: center; justify-content: center; }
            
            .gp-day { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: 0.1s; position: relative; z-index: 1; }
            .gp-day:hover:not(.outside) { background: var(--gp-primary); color: white; border-radius: 4px; }
            .gp-day.selected { background: var(--gp-primary) !important; color: white !important; border-radius: 4px; }
            .gp-day.in-range { background: var(--gp-range); border-radius: 0; }
            .gp-day.outside { color: #cbd5e1; cursor: default; pointer-events: none; }
            
            /* DoubleDate Styles */
            .gp-doubledate-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 25px; min-width: 320px; }
            .p-btn-item { padding: 15px; border: 1px solid var(--gp-border); border-radius: 8px; cursor: pointer; text-align: center; font-weight: 800; font-size: 15px; transition: 0.2s; }
            .p-btn-item:hover { border-color: var(--gp-primary); background: var(--gp-range); color: var(--gp-primary); }

            .gp-footer { padding: 12px 20px; border-top: 1px solid var(--gp-border); display: flex; justify-content: flex-end; background: #fcfcfd; }
            .btn-apply { background: var(--gp-primary); color: white; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
        `;
        document.head.appendChild(style);
    }

    _buildHTML() {
        const wrapper = document.createElement('div');
        wrapper.id = this.pickerId;
        wrapper.className = 'gp-picker';
        wrapper.innerHTML = `
            <div class="gp-sidebar">
                <div class="gp-menu-item" data-range="today">Today</div>
                <div class="gp-menu-item" data-range="last_7">Last 7 Days</div>
                <div class="gp-menu-item" data-range="this_month">This Month</div>
                <div class="gp-menu-item active" data-range="custom_sidebar">Custom Range</div>
            </div>
            <div class="gp-main">
                <div class="gp-nav">
                    <button type="button" class="btn-nav prev">❮</button>
                    <span class="nav-title"></span>
                    <button type="button" class="btn-nav next">❯</button>
                </div>
                <div class="gp-content-area">
                    <div class="gp-panes"></div>
                    <div class="gp-doubledate-grid" style="display:none"></div>
                </div>
                <div class="gp-footer"><button type="button" class="btn-apply">Apply</button></div>
            </div>
        `;
        document.body.appendChild(wrapper);
        this.pickerEl = wrapper;
    }

    _updatePosition() {
        const rect = this.input.getBoundingClientRect();
        this.pickerEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
        this.pickerEl.style.left = `${rect.left + window.scrollX}px`;
    }

    _initEvents() {
        this.input.onclick = (e) => {
            e.stopPropagation();
            this._updatePosition();
            this.pickerEl.classList.toggle('show');
            this.render();
        };

        this.pickerEl.querySelector('.prev').onclick = (e) => { e.stopPropagation(); this.navigate(-1); };
        this.pickerEl.querySelector('.next').onclick = (e) => { e.stopPropagation(); this.navigate(1); };
        this.pickerEl.querySelector('.btn-apply').onclick = (e) => { e.stopPropagation(); this.apply(); };

        this.pickerEl.querySelectorAll('.gp-menu-item').forEach(el => {
            el.onclick = (e) => {
                e.stopPropagation();
                this.pickerEl.querySelectorAll('.gp-menu-item').forEach(i => i.classList.remove('active'));
                el.classList.add('active');
                this._handleShortcut(el.dataset.range);
            };
        });

        document.addEventListener('click', (e) => {
            if (!this.pickerEl.contains(e.target) && e.target !== this.input) this.pickerEl.classList.remove('show');
        });
    }

    navigate(step) {
        if (this.mode === 'doubledate') {
            this.viewYear += step;
        } else if (this.mode === 'custom') {
            const nextIdx = this.viewIdx + (step * 2);
            if (nextIdx >= 0 && nextIdx < this.accountingConfig.length) this.viewIdx = nextIdx;
        } else {
            this.viewMonth += step;
            if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
            if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
        }
        this.render();
    }

    _handleShortcut(range) {
        const today = new Date(); today.setHours(0,0,0,0);
        if (range === 'today') this.start = this.end = today;
        if (range === 'last_7') { this.start = new Date(); this.start.setDate(today.getDate()-6); this.end = today; }
        if (range === 'this_month') { this.start = new Date(today.getFullYear(), today.getMonth(), 1); this.end = new Date(today.getFullYear(), today.getMonth()+1, 0); }
        this.render();
        if (range !== 'custom_sidebar') this.apply();
    }

    render() {
        const title = this.pickerEl.querySelector('.nav-title');
        const panesContainer = this.pickerEl.querySelector('.gp-panes');
        const dGrid = this.pickerEl.querySelector('.gp-doubledate-grid');
        const sidebar = this.pickerEl.querySelector('.gp-sidebar');

        panesContainer.innerHTML = ''; dGrid.innerHTML = '';
        sidebar.style.display = (this.mode === 'doubledate') ? 'none' : 'flex';

        if (this.mode === 'doubledate') {
            title.innerText = `DOUBLE DATE ${this.viewYear}`;
            panesContainer.style.display = 'none';
            dGrid.style.display = 'grid';
            for (let i = 1; i <= 12; i++) {
                const btn = document.createElement('div');
                btn.className = 'p-btn-item';
                btn.innerText = `${i}/${i}`;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    this.start = this.end = new Date(this.viewYear, i - 1, i);
                    this.apply();
                };
                dGrid.appendChild(btn);
            }
        } else {
            panesContainer.style.display = 'flex';
            dGrid.style.display = 'none';
            title.innerText = (this.mode === 'custom') ? `ACCOUNTING ${this.viewYear}` : `CALENDAR ${this.viewYear}`;
            let data = [];
            if (this.mode === 'custom') {
                [this.viewIdx, this.viewIdx + 1].forEach(i => { if(this.accountingConfig[i]) data.push(this.accountingConfig[i]); });
            } else {
                for (let i = 0; i < 2; i++) {
                    let m = this.viewMonth + i, y = this.viewYear;
                    if (m > 11) { m -= 12; y++; }
                    data.push({
                        label: new Date(y, m).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                        start: new Date(y, m, 1),
                        end: new Date(y, m + 1, 0)
                    });
                }
            }
            data.forEach(p => this._createPane(p, panesContainer));
        }
    }

    _createPane(p, container) {
        const box = document.createElement('div');
        box.className = 'gp-month-box';
        box.innerHTML = `<div class="gp-month-title">${p.label}</div><div class="gp-grid"></div>`;
        const grid = box.querySelector('.gp-grid');

        ['SU','MO','TU','WE','TH','FR','SA'].forEach(h => {
            const el = document.createElement('div'); el.className = 'gp-head'; el.innerText = h; grid.appendChild(el);
        });

        const firstDay = p.start.getDay();
        const prevMonthEnd = new Date(p.start); prevMonthEnd.setDate(0);
        for (let i = firstDay - 1; i >= 0; i--) {
            grid.appendChild(this._createDay(prevMonthEnd.getDate() - i, 'outside'));
        }

        let curr = new Date(p.start);
        while (curr <= p.end) {
            const d = new Date(curr);
            const el = this._createDay(d.getDate());
            if (this.start && d.toDateString() === this.start.toDateString()) el.classList.add('selected');
            if (this.end && d.toDateString() === this.end.toDateString()) el.classList.add('selected');
            if (this.start && this.end && d > this.start && d < this.end) el.classList.add('in-range');
            el.onclick = (e) => {
                e.stopPropagation();
                if (!this.start || (this.start && this.end)) { this.start = d; this.end = null; }
                else { if (d < this.start) { this.end = this.start; this.start = d; } else { this.end = d; } }
                this.render();
            };
            grid.appendChild(el);
            curr.setDate(curr.getDate() + 1);
        }

        const remaining = 42 - (grid.children.length - 7);
        for (let i = 1; i <= remaining; i++) {
            grid.appendChild(this._createDay(i, 'outside'));
        }
        container.appendChild(box);
    }

    _createDay(text, status = '') {
        const div = document.createElement('div');
        div.className = `gp-day ${status}`;
        div.innerText = text;
        return div;
    }

    apply() {
        if (this.start) {
            const f = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            this.input.value = (!this.end || this.start.toDateString() === this.end.toDateString()) 
                ? f(this.start) : `${f(this.start)} - ${f(this.end)}`;
            this.pickerEl.classList.remove('show');
        }
    }
}