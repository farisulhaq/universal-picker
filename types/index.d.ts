/**
 * UniversalPicker.js - TypeScript Definitions
 */

export interface UniversalPickerTheme {
    primaryColor?: string;
    rangeColor?: string;
    borderColor?: string;
    textColor?: string;
    bgColor?: string;
    sidebarBg?: string;
    fontFamily?: string;
}

export interface UniversalPickerLocale {
    direction?: 'ltr' | 'rtl';
    applyLabel?: string;
    cancelLabel?: string;
    customRangeLabel?: string;
    monthNames?: string[];
    monthNamesShort?: string[];
    dayNames?: string[];
    dayNamesShort?: string[];
    weekLabel?: string;
}

export interface AccountingPeriod {
    label: string;
    start: Date;
    end: Date;
}

export interface DateRangeData {
    startDate: Date | null;
    endDate: Date | null;
}

export interface UniversalPickerOptions {
    mode?: 'default' | 'custom' | 'doubledate';
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    singleDatePicker?: boolean;
    showDropdowns?: boolean;
    showCalendars?: 1 | 2;
    format?: string;
    separator?: string;
    autoApply?: boolean;
    showWeekNumbers?: boolean;
    firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    linkedCalendars?: boolean;
    opens?: 'left' | 'right' | 'center' | 'auto';
    drops?: 'up' | 'down' | 'auto';
    ranges?: Record<string, [Date, Date] | (() => [Date, Date])> | null;
    accountingConfig?: AccountingPeriod[];
    theme?: UniversalPickerTheme;
    locale?: UniversalPickerLocale;
    isInvalidDate?: ((date: Date) => boolean) | null;
    isCustomDate?: ((date: Date) => string | string[] | null) | null;

    // Callbacks
    onShow?: (data: DateRangeData) => void;
    onHide?: (data: DateRangeData) => void;
    onApply?: (data: DateRangeData) => void;
    onCancel?: (data: DateRangeData) => void;
    onChange?: (data: DateRangeData) => void;
    onSelect?: (data: DateRangeData) => void;
}

declare class UniversalPicker {
    constructor(element: string | HTMLElement, options?: UniversalPickerOptions);

    /** Current start date */
    startDate: Date | null;
    /** Current end date */
    endDate: Date | null;
    /** Minimum selectable date */
    minDate: Date | null;
    /** Maximum selectable date */
    maxDate: Date | null;
    /** Whether the picker is currently visible */
    isShowing: boolean;
    /** The input/trigger element */
    element: HTMLElement;
    /** The picker container element */
    container: HTMLElement;
    /** Merged options */
    options: UniversalPickerOptions;

    /** Show the picker */
    show(): void;
    /** Hide the picker */
    hide(): void;
    /** Toggle picker visibility */
    toggle(): void;
    /** Apply the current selection and close */
    apply(): void;
    /** Cancel and revert to previous selection */
    cancel(): void;
    /** Set the date range programmatically */
    setDateRange(startDate: Date | string | null, endDate?: Date | string | null): void;
    /** Set start date */
    setStartDate(date: Date | string): void;
    /** Set end date */
    setEndDate(date: Date | string): void;
    /** Get the current date range */
    getDateRange(): DateRangeData;
    /** Set minimum selectable date */
    setMinDate(date: Date | string | null): void;
    /** Set maximum selectable date */
    setMaxDate(date: Date | string | null): void;
    /** Update options dynamically */
    updateOptions(options: Partial<UniversalPickerOptions>): void;
    /** Destroy the picker and clean up */
    destroy(): void;

    /** Get instance from element */
    static getInstance(element: string | HTMLElement): UniversalPicker | null;
    /** Library version */
    static VERSION: string;
}

export default UniversalPicker;
