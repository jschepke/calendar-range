import { DateTime } from "luxon";

import { applyOffset } from "./applyOffset";
import { RANGE_TYPE, WEEKDAY } from "./constants";
import {
	EmptyDateRangeError,
	InvalidDateRangeError,
	InvalidParameterError,
	MissingArgumentError,
} from "./errors";
import { isValidOffset, isValidRefDate, isValidWeekday } from "./utils";
import {
	validateDaysCount,
	validateEndOffset,
	validateObjectArgument,
	validateRefDate,
	validateRefWeekday,
	validateStartOffset,
} from "./validators/common";

interface OptionsAll
	extends OptionsDays,
		OptionsMonthExact,
		OptionsMonthExtended,
		OptionsWeek {}

export interface DateRangeMembers extends Required<OptionsAll> {
	rangeType: RANGE_TYPE;
	dateTimes: DateTime[];
	isNext: boolean;
	isPrevious: boolean;
}
// DateRangeDefaults inherits DateRangeMembers but makes ‘rangeType’ optional.
interface DateRangeDefaults
	extends Pick<Partial<DateRangeMembers>, "rangeType">,
		Omit<DateRangeMembers, "rangeType"> {}

const dateRangeDefaults: DateRangeDefaults = {
	rangeType: undefined,
	daysCount: 0,
	endOffset: 0,
	get refDate() {
		return DateTime.now();
	},
	refWeekday: WEEKDAY.Monday,
	startOffset: 0,
	dateTimes: [],
	isNext: false,
	isPrevious: false,
};

export interface Offset {
	/**
	 * The number of days to add or remove from the beginning of the range.
	 *
	 * @remarks
	 * If the specified offset is positive, dates are added. If negative, dates are removed.
	 *
	 * @defaultValue `0`
	 *
	 * @example
	 * ```
	 * // set the reference date
	 * const refDate = new Date("2020-01-17");
	 *
	 * // with no offset 👈
	 * const month1 = new DateRange().getMonthExact({ refDate });
	 * // first date in range
	 * month1.dateTimes[0]; // Jan 1, 2020
	 * // last date in range
	 * month1.dateTimes[month1.dateTimes.length - 1]; // Jan 31, 2020
	 *
	 * // with positive startOffset 👈
	 * const month2 = new DateRange().getMonthExact({ refDate, startOffset: 5 });
	 * // first date in range
	 * month2.dateTimes[0]; // Dec 27, 2020
	 * // last date in range (no changes)
	 * month2.dateTimes[month2.dateTimes.length - 1]; // Jan 31, 2020
	 *
	 * // with negative startOffset 👈
	 * const month3 = new DateRange().getMonthExact({ refDate, startOffset: -5 });
	 * // first date in range
	 * month3.dateTimes[0]; // Jan 6, 2020
	 * // last date in range (no changes)
	 * month3.dateTimes[month3.dateTimes.length - 1]; // Jan 31, 2020
	 * ```
	 */
	startOffset?: number;

	/**
	 * The number of days to add or remove from the end of the range.
	 *
	 * @remarks
	 * If the specified offset is positive, dates are added. If negative, dates are removed.
	 *
	 * @defaultValue `0`
	 *
	 * @example
	 * ```
	 * // set the reference date
	 * const refDate = new Date("2020-01-17");
	 *
	 * // with no offset 👈
	 * const month1 = new DateRange().getMonthExact({ refDate });
	 * // first date in range
	 * month1.dateTimes[0]; // Jan 1, 2020
	 * // last date in range
	 * month1.dateTimes[month1.dateTimes.length - 1]; // Jan 31, 2020
	 *
	 * // with positive endOffset 👈
	 * const month2 = new DateRange().getMonthExact({ refDate, endOffset: 5 });
	 * // first date in range (no changes)
	 * month2.dateTimes[0]; // Jan 1, 2020
	 * // last date in range
	 * month2.dateTimes[month2.dateTimes.length - 1]; // Feb 5, 2020
	 *
	 * // with negative endOffset 👈
	 * const month3 = new DateRange().getMonthExact({ refDate, endOffset: -5 });
	 * // first date in range (no changes)
	 * month3.dateTimes[0]; // Jan 1, 2020
	 * // last date in range
	 * month3.dateTimes[month3.dateTimes.length - 1]; // Jan 26, 2020
	 * ```
	 */
	endOffset?: number;
}

interface RefDate {
	/**
	 * The reference date to calculate the range.
	 *
	 * @remarks
	 * Must be a Date object or luxon DateTime object.
	 * Defaults to current time.
	 *
	 * @example
	 * ```
	 * // with DateTime
	 * new DateRange().getWeek({ refDate: DateTime.fromISO('2023-05-15') });
	 *
	 * // with Date
	 * new DateRange().getWeek({ refDate: new Date("2023-05-15") });
	 * ```
	 */
	refDate?: DateTime | Date;
}

interface RefWeekday {
	/**
	 * The reference weekday to start the range from.
	 *
	 *@remarks
	 * Must be an integer from 1 (Monday) to 7 (Sunday).
	 * Defaults to Monday.
	 *
	 *@example
	 * ```
	 * // with WEEKDAY enum. The range will start from Sunday
	 * new DateRange().getWeek({refWeekday: WEEKDAY.Sunday });
	 * // the equivalent with a number
	 * new DateRange().getWeek({ refWeekday: 7 });
	 * ```
	 */
	refWeekday?: WEEKDAY;
}

interface DaysCount {
	/**
	 * The number of days to be included in the range generated with `getDays` method.
	 */
	daysCount?: number;
}

export interface OptionsWeek extends RefDate, RefWeekday, Offset {}

export interface OptionsDays extends RefDate, DaysCount, Offset {}

export interface OptionsMonthExact extends RefDate, Offset {}

export interface OptionsMonthExtended extends RefDate, RefWeekday, Offset {}

/**
 * DateRange is the core component of easy-date-range. It provides various methods and properties for generating and handling date ranges.
 *
 * @remarks
 * To use the class, an instance must be created and initialized with one of the range generator methods.
 */
export class DateRange {
	/**
	 * refDate of the instance.
	 *
	 * @remarks Default to current time.
	 */
	private _refDate: DateTime | undefined;

	/**
	 * refWeekday of the instance.
	 */
	private _refWeekday: WEEKDAY | undefined;

	/**
	 * startOffset of the instance.
	 */
	private _startOffset: number | undefined;

	/**
	 * endOffset of the instance.
	 */
	private _endOffset: number | undefined;

	/**
	 * The instance dates storage.
	 */
	private _dateTimes: DateTime[] | undefined;

	/**
	 * The type of a current generated date range.
	 */
	private _rangeType: RANGE_TYPE | undefined;

	/**
	 * Count of days used with getDays() method.
	 */
	private _daysCount: number | undefined;

	/**
	 * Indicates whether the DateRange is generated with a `getNext` method.
	 */
	private _isNext: boolean | undefined;

	/**
	 * Indicates whether the DateRange is generated with a `getPrevious` method.
	 */
	private _isPrevious: boolean | undefined;

	/**
	 * DateRange is an entry point for creating and storing a range of dates.
	 *
	 * @remarks
	 * The dates can be generated with get methods.
	 *
	 * The constructor does not accept any parameters.
	 */
	constructor() {
		// rome-ignore lint/style/noArguments: check specifically for empty arguments array
		if (arguments.length > 0) {
			throw new InvalidParameterError(
				"parameter passed to DateRange instance",
				// rome-ignore lint/style/noArguments: check specifically for empty arguments array
				arguments.length === 1 ? arguments[0] : [...arguments],
				"no parameters",
				"Option parameters should be specified within DateRange methods.",
			);
		}
	}

	/**
	 * The reference date for this instance.
	 */
	get refDate(): DateTime {
		if (this._refDate === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access refDate before it has been initialized. Call one of the getMethods to generate the range and set the refDate.",
			);
		}
		return this._refDate;
	}

	/**
	 * The reference weekday for this instance.
	 */
	get refWeekday(): WEEKDAY {
		if (this._refWeekday === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access refWeekday before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._refWeekday;
	}

	/**
	 * The array of luxon DateTimes for this instance.
	 *
	 * @remarks
	 * To get JS Dates use `toJSDates()` method.
	 */
	get dateTimes(): DateTime[] {
		if (this._dateTimes === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access dates before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._dateTimes;
	}

	/**
	 * The start offset for this instance.
	 */
	public get startOffset(): number {
		if (this._startOffset === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access startOffset property before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._startOffset;
	}

	/**
	 * The end offset for this instance.
	 */
	public get endOffset(): number {
		if (this._endOffset === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access endOffset property before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._endOffset;
	}

	/**
	 * The days count used with `getDays()` method for this instance.
	 */
	public get daysCount(): number {
		if (this._daysCount === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access daysCount property before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._daysCount;
	}

	/**
	 * The type of range generated for this instance.
	 *
	 * @remarks
	 * See {@link RANGE_TYPE| the RANGE_TYPE enum} for more details.
	 *
	 * If `undefined`, the range has not been created yet.
	 *
	 */
	public get rangeType(): RANGE_TYPE {
		if (this._rangeType === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access rangeType property before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._rangeType;
	}

	/**
	 * A boolean that indicates whether DateRange is created with a `getNext` method.
	 */
	public get isNext() {
		if (this._isNext === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access isNext property before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._isNext;
	}

	/**
	 * A boolean that indicates whether DateRange is created with a `getPrevious` method.
	 */
	public get isPrevious() {
		if (this._isPrevious === undefined) {
			// Todo: Refactor to custom error
			throw new Error(
				"You try to access isPrevious property before it has been initialized. Call one of the getMethods to generate the range and set instance members.",
			);
		}
		return this._isPrevious;
	}

	/**
	 * Sets or updates the instance members of the DateRange object.
	 *
	 * @param members - An object containing the properties of the DateRange object to be set or updated.
	 * @private
	 * */
	private _setMembers(members: DateRangeMembers) {
		const {
			rangeType,
			refDate,
			refWeekday,
			startOffset,
			endOffset,
			daysCount,
			dateTimes,
			isNext,
			isPrevious,
		} = members;

		// Update instance members if different from current one

		if (rangeType !== this._rangeType) {
			this._rangeType = rangeType;
		}
		if (refDate !== this._refDate) {
			this._refDate =
				refDate instanceof Date ? DateTime.fromJSDate(refDate) : refDate;
		}
		if (refWeekday !== this._refWeekday) {
			this._refWeekday = refWeekday;
		}
		if (startOffset !== this._startOffset) {
			this._startOffset = startOffset;
		}
		if (endOffset !== this._endOffset) {
			this._endOffset = endOffset;
		}
		if (daysCount !== this._daysCount) {
			this._daysCount = daysCount;
		}
		if (isNext !== this._isNext) {
			this._isNext = isNext;
		}
		if (isPrevious !== this._isPrevious) {
			this._isPrevious = isPrevious;
		}

		this._dateTimes = dateTimes;
	}

	/*================================ Utility METHODS ==============================*/

	/**
	 * Checks if a given value is a valid reference date.
	 *
	 * @remarks A reference date can be either a JS `Date` object or a Luxon `DateTime` object.
	 *
	 * @param refDate - The value to check.
	 * @returns True if the value is a valid reference date, false otherwise.
	 */
	public isValidRefDate(refDate: unknown): boolean {
		return isValidRefDate(refDate);
	}

	/**
	 * Checks if a given value is a valid weekday (integer from 1 to 7).
	 *
	 * @param weekday - The value to check.
	 * @returns True if weekday is an integer from 1 to 7, false otherwise.
	 */
	public isValidRefWeekday(weekday: unknown): boolean {
		return isValidWeekday(weekday);
	}

	/**
	 * Checks if a given value is a valid offset (non-negative integer).
	 *
	 * @param offset - The value to check.
	 * @returns True if the value is a non-negative integer, false otherwise.
	 */
	public isValidOffset(offset: unknown): boolean {
		return isValidOffset(offset);
	}

	/*================================ CONVERTING METHODS ==============================*/

	/**
	 * Returns an array of dates generated for the instance as Luxon DateTime objects.
	 */
	public toDateTimes(): DateTime[] {
		return this.dateTimes;
	}

	/**
	 * Returns an array of dates generated for the instance as JS Date objects.
	 */
	public toDates(): Date[] {
		return this.dateTimes.map((date) => date.toJSDate());
	}

	/*================================ TIME RANGE METHODS ==============================*/

	/**
	 * Creates a single week range.
	 *
	 * @remarks
	 * - By default, the method starts the range on Monday before or on the reference date and ends
	 * it on Sunday after or on the reference date.
	 *
	 * - If not specified, the reference date is set to the current time.
	 *
	 * - Each date is set to the start of the day (midnight).
	 *
	 * @param options - An optional object to customize the date range.
	 * @returns The `DateRange` with generated dates.
	 *
	 * @example
	 *  ```
	 * // get current week starting on Monday
	 * const week1 = new DateRange().getWeek();
	 *
	 * // get week based on a refDate and starting on Sunday
	 * const week2 = new DateRange().getWeek({
	 * 	refDate: new Date("2023-01-10"),
	 * 	refWeekday: WEEKDAY.Sunday,
	 * });
	 * // Generated dates:👇
	 * // Sunday, January 8, 2023 at 12:00:00 AM
	 * // Monday, January 9, 2023 at 12:00:00 AM
	 * // Tuesday, January 10, 2023 at 12:00:00 AM
	 * // Wednesday, January 11, 2023 at 12:00:00 AM
	 * // Thursday, January 12, 2023 at 12:00:00 AM
	 * // Friday, January 13, 2023 at 12:00:00 AM
	 * // Saturday, January 14, 2023 at 12:00:00 AM
	 * ```
	 */
	public getWeek(options?: OptionsWeek): DateRange {
		// Input validation

		// Perform validation only for specified properties in the 'options' object
		if (options !== undefined) {
			// Check if 'options' argument is an object
			validateObjectArgument(options);

			// Validate specified properties in 'options' object
			const { refDate, refWeekday, endOffset, startOffset } = options;
			refDate !== undefined && validateRefDate(refDate);
			refWeekday !== undefined && validateRefWeekday(refWeekday);
			startOffset !== undefined && validateStartOffset(startOffset);
			endOffset !== undefined && validateEndOffset(endOffset);
		}

		const {
			refDate = dateRangeDefaults.refDate,
			refWeekday = dateRangeDefaults.refWeekday,
			startOffset = dateRangeDefaults.startOffset,
			endOffset = dateRangeDefaults.endOffset,
		} = options || {};

		const dateRangeMembers: DateRangeMembers = {
			rangeType: RANGE_TYPE.Week,
			dateTimes: [],
			refDate,
			refWeekday,
			endOffset,
			startOffset,
			isNext: dateRangeDefaults.isNext,
			isPrevious: dateRangeDefaults.isPrevious,
			daysCount: dateRangeDefaults.daysCount,
		};

		// Set date at the beginning of a day
		let firstDayOfRange: DateTime;
		if (refDate instanceof Date) {
			firstDayOfRange = DateTime.fromJSDate(refDate).startOf("day");
		} else {
			firstDayOfRange = refDate.startOf("day");
		}

		// Find the first date of a week range
		while (firstDayOfRange.weekday !== refWeekday) {
			firstDayOfRange = firstDayOfRange.minus({ days: 1 });
		}

		const dateTimes = dateRangeMembers.dateTimes;

		let currentDay = firstDayOfRange;
		while (dateTimes.length < 7) {
			dateTimes.push(currentDay);
			currentDay = currentDay.plus({ day: 1 });
		}

		// apply offset if specified
		if (startOffset || endOffset) {
			const adjustedDateRange = applyOffset({
				rangeToAdjust: dateTimes,
				timeUnit: "days",
				startOffset,
				endOffset,
			});

			this._setMembers({
				...dateRangeMembers,
				dateTimes: [...adjustedDateRange],
			});

			return this;
		} else {
			this._setMembers(dateRangeMembers);

			return this;
		}
	}

	/**
	 *
	 * Creates a single month range extended to include the full weeks.
	 *
	 * @remarks
	 *
	 * - By default, the method starts the range on Monday before or on the first day of the month and ends
	 * it on Sunday after or on the last day of the month.
	 *
	 * - If not specified, the reference date is set to the current time.
	 *
	 * - Each date is set to the start of the day (midnight).
	 *
	 * @param options - An optional object to customize the date range.
	 * @returns The `DateRange` with generated dates.
	 * @example
	 *  ```
	 * // Get current month extended to full weeks
	 * const monthExtended1 = new DateRange().getMonthExtended();
	 *
	 * // Get month extended to full weeks based on a refDate and starting on Wednesday
	 * const monthExtended2 = new DateRange().getMonthExtended({
	 * 	refDate: new Date("2023-01-10"),
	 * 	refWeekday: WEEKDAY.Wednesday,
	 * });
	 * // Generated dates:
	 * // Wednesday, December 28, 2022 at 12:00:00 AM -> The first date of the range
	 * // Thursday, December 29, 2022 at 12:00:00 AM
	 * // Friday, December 30, 2022 at 12:00:00 AM
	 * // ...
	 * // Tuesday, January 31, 2023 at 12:00:00 AM -> The last date of the range
	 * ```
	 */
	public getMonthExtended(options?: OptionsMonthExtended): DateRange {
		// Input validation
		// Perform validation only for specified properties in the 'options' object
		if (options !== undefined) {
			// Check if 'options' argument is an object
			validateObjectArgument(options);

			// Validate specified properties in 'options' object
			const { refDate, refWeekday, endOffset, startOffset } = options;
			refDate !== undefined && validateRefDate(refDate);
			refWeekday !== undefined && validateRefWeekday(refWeekday);
			startOffset !== undefined && validateStartOffset(startOffset);
			endOffset !== undefined && validateEndOffset(endOffset);
		}

		const {
			refDate = dateRangeDefaults.refDate,
			refWeekday = dateRangeDefaults.refWeekday,
			startOffset = dateRangeDefaults.startOffset,
			endOffset = dateRangeDefaults.endOffset,
		} = options || {};

		const dateRangeMembers: DateRangeMembers = {
			rangeType: RANGE_TYPE.MonthExtended,
			dateTimes: [],
			refDate,
			refWeekday,
			endOffset,
			startOffset,
			isNext: dateRangeDefaults.isNext,
			isPrevious: dateRangeDefaults.isPrevious,
			daysCount: dateRangeDefaults.daysCount,
		};

		// Find the last weekday of the range
		const lastWeekday = refWeekday - 1 === 0 ? 7 : refWeekday - 1;

		// Find the first and the last day of the month
		let firstDayOfMonth: DateTime;
		let lastDayOfMonth: DateTime;

		if (refDate instanceof Date) {
			firstDayOfMonth = DateTime.fromJSDate(refDate).startOf("month");
			lastDayOfMonth = DateTime.fromJSDate(refDate).endOf("month");
		} else {
			firstDayOfMonth = refDate.startOf("month");
			lastDayOfMonth = refDate.endOf("month");
		}

		const dateTimes = dateRangeMembers.dateTimes;

		// Find the first date of a range aligned with a begging of a week
		let firstDayOfRange: DateTime = firstDayOfMonth;
		while (firstDayOfRange.weekday !== refWeekday) {
			firstDayOfRange = firstDayOfRange.minus({ days: 1 });
		}

		// Loop over the dates to the last day of month
		let currentDay = firstDayOfRange;
		while (currentDay.valueOf() < lastDayOfMonth.valueOf()) {
			dateTimes.push(currentDay);
			currentDay = currentDay.plus({ day: 1 });
		}

		// Find the last date of a range aligned with an ending of a week
		while (dateTimes[dateTimes.length - 1].weekday !== lastWeekday) {
			dateTimes.push(dateTimes[dateTimes.length - 1].plus({ days: 1 }));
		}

		// Apply offset if specified
		if (startOffset || endOffset) {
			const adjustedDateRange = applyOffset({
				rangeToAdjust: dateTimes,
				timeUnit: "days",
				startOffset,
				endOffset,
			});

			this._setMembers({
				...dateRangeMembers,
				dateTimes: [...adjustedDateRange],
			});

			return this;
		} else {
			this._setMembers(dateRangeMembers);

			return this;
		}
	}

	/**
	 * Creates a single month range, from the first to the last day of the month.
	 *
	 * @remarks
	 *
	 * - By default, the method starts the range on the first day of the month and ends
	 * it on the last day of the month.
	 *
	 * - If not specified, the reference date is set to the current time.
	 *
	 * - Each date is set to the start of the day (midnight).
	 *
	 * @param options - An optional object to customize the date range.
	 * @returns The `DateRange` with generated dates.
	 * @example
	 *  ```
	 * // Get current month
	 * const month1 = new DateRange().getMonthExact();
	 *
	 * // Get month with specified refDate
	 * const month2 = new DateRange().getMonthExact({
	 * 	refDate: new Date("2023-01-10"),
	 * });
	 * // Generated dates:
	 * // Sunday, January 1, 2023 at 12:00:00 AM -> The first date of the range
	 * // Monday, January 2, 2023 at 12:00:00 AM
	 * // Tuesday, January 3, 2023 at 12:00:00 AM
	 * // ...
	 * // Tuesday, January 31, 2023 at 12:00:00 AM -> The last date of the range
	 *
	 * // Get month with specified refDate and offsets
	 * const month3 = new DateRange().getMonthExact({
	 * 	refDate: new Date("2023-01-10"),
	 * 	startOffset: 2,
	 * 	endOffset: 2,
	 * });
	 * // Friday, December 30, 2022 at 12:00:00 AM  -> The range starts 2 days before default first day
	 * // Saturday, December 31, 2022 at 12:00:00 AM
	 * // Sunday, January 1, 2023 at 12:00:00 AM
	 * // ...
	 * // Tuesday, January 31, 2023 at 12:00:00 AM
	 * // Wednesday, February 1, 2023 at 12:00:00 AM
	 * // Thursday, February 2, 2023 at 12:00:00 AM -> The range ends 2 days after default last day
	 * ```
	 */
	public getMonthExact(options?: OptionsMonthExact): DateRange {
		// Input validation
		// Perform validation only for specified properties in the 'options' object
		if (options !== undefined) {
			// Check if 'options' argument is an object
			validateObjectArgument(options);

			// Validate specified properties in 'options' object
			const { refDate, endOffset, startOffset } = options;
			refDate !== undefined && validateRefDate(refDate);
			startOffset !== undefined && validateStartOffset(startOffset);
			endOffset !== undefined && validateEndOffset(endOffset);
		}

		const {
			refDate = dateRangeDefaults.refDate,
			startOffset = dateRangeDefaults.startOffset,
			endOffset = dateRangeDefaults.endOffset,
		} = options || {};

		const dateRangeMembers: DateRangeMembers = {
			rangeType: RANGE_TYPE.MonthExact,
			dateTimes: [],
			refDate,
			refWeekday: dateRangeDefaults.refWeekday,
			endOffset,
			startOffset,
			isNext: dateRangeDefaults.isNext,
			isPrevious: dateRangeDefaults.isPrevious,
			daysCount: dateRangeDefaults.daysCount,
		};

		// Find the first and the last day of the month
		let firstDayOfMonth: DateTime;
		let lastDayOfMonth: DateTime;

		if (refDate instanceof Date) {
			firstDayOfMonth = DateTime.fromJSDate(refDate).startOf("month");
			lastDayOfMonth = DateTime.fromJSDate(refDate).endOf("month");
		} else {
			firstDayOfMonth = refDate.startOf("month");
			lastDayOfMonth = refDate.endOf("month");
		}

		const dates = dateRangeMembers.dateTimes;

		let currentDay = firstDayOfMonth;
		while (currentDay.valueOf() < lastDayOfMonth.valueOf()) {
			dates.push(currentDay);
			currentDay = currentDay.plus({ day: 1 });
		}

		// Apply offset if specified
		if (startOffset || endOffset) {
			// Apply offset if specified
			const adjustedDateRange = applyOffset({
				rangeToAdjust: dates,
				timeUnit: "days",
				startOffset,
				endOffset,
			});

			this._setMembers({
				...dateRangeMembers,
				dateTimes: [...adjustedDateRange],
			});

			return this;
		} else {
			this._setMembers(dateRangeMembers);

			return this;
		}
	}

	/**
	 * Creates a range of custom number of days.
	 *
	 * @remarks
	 * - The reference date is a starting point of the range.
	 *
	 * - If not specified, the reference date is set to the current day.
	 *
	 * - The length of the range can be specified with the `daysCount` property in the `options` object.
	 * If not specified, the range will be created with a single date.
	 *
	 * - Each date is set to the start of the day (midnight).
	 *
	 * @param options - An optional object to customize the date range.
	 * @returns The DateRange with generated dates.
	 * @example
	 * ```
	 * // Get a current date
	 * const range1 = new DateRange().getDays();
	 *
	 * // Get a range of 10 days starting on 2023-01-10
	 * const range2 = new DateRange().getDays({
	 * 	daysCount: 10,
	 * 	refDate: new Date("2023-01-10"),
	 * });
	 * // Generated dates:
	 * // January 10, 2023 at 12:00:00 AM
	 * // January 11, 2023 at 12:00:00 AM
	 * // January 12, 2023 at 12:00:00 AM
	 * // January 13, 2023 at 12:00:00 AM
	 * // January 14, 2023 at 12:00:00 AM
	 * // January 15, 2023 at 12:00:00 AM
	 * // January 16, 2023 at 12:00:00 AM
	 * // January 17, 2023 at 12:00:00 AM
	 * // January 18, 2023 at 12:00:00 AM
	 * // January 19, 2023 at 12:00:00 AM
	 * ```
	 */
	public getDays(options?: OptionsDays): DateRange {
		// Input validation
		// Perform validation only for specified properties in the 'options' object
		if (options !== undefined) {
			// Check if 'options' argument is an object
			validateObjectArgument(options);

			// Validate specified properties in 'options' object
			const { refDate, endOffset, startOffset, daysCount } = options;
			refDate !== undefined && validateRefDate(refDate);
			startOffset !== undefined && validateStartOffset(startOffset);
			endOffset !== undefined && validateEndOffset(endOffset);
			daysCount !== undefined && validateDaysCount(daysCount);
		}

		const {
			refDate = dateRangeDefaults.refDate,
			startOffset = dateRangeDefaults.startOffset,
			endOffset = dateRangeDefaults.endOffset,
			daysCount = 1,
		} = options || {};

		const dateRangeMembers: DateRangeMembers = {
			rangeType: RANGE_TYPE.Days,
			dateTimes: [],
			refDate,
			refWeekday: dateRangeDefaults.refWeekday,
			endOffset,
			startOffset,
			isNext: dateRangeDefaults.isNext,
			isPrevious: dateRangeDefaults.isPrevious,
			daysCount,
		};

		// Set date at the beginning of a day
		let firstDayOfRange: DateTime;
		if (refDate instanceof Date) {
			firstDayOfRange = DateTime.fromJSDate(refDate).startOf("day");
		} else {
			firstDayOfRange = refDate.startOf("day");
		}

		const dateTimes = dateRangeMembers.dateTimes;

		let currentDay = firstDayOfRange;
		while (dateTimes.length < daysCount) {
			dateTimes.push(currentDay);
			currentDay = currentDay.plus({ day: 1 });
		}

		// apply offset if specified
		if (startOffset || endOffset) {
			const adjustedDateRange = applyOffset({
				rangeToAdjust: dateTimes,
				timeUnit: "days",
				startOffset,
				endOffset,
			});

			this._setMembers({
				...dateRangeMembers,
				dateTimes: [...adjustedDateRange],
			});

			return this;
		} else {
			this._setMembers(dateRangeMembers);

			return this;
		}
	}

	/**
	 *
	 * Generates the next range based on given one.
	 *
	 * @remarks
	 * The method takes a DateRange object and based on its range type,
	 * sets the refDate to a date that can generate the new range.
	 *
	 * It copies the options used to adjust the given range and applies them to the new range.
	 *
	 * The method shifts the refDate to the next one as follows:
	 * - for a range generated with getDays, the refDate is incremented by the daysCount property.
	 * - for a range generated with getWeek, the refDate is incremented by 7 days.
	 * - for a range generated with getMonthExact and getMonthExtended, the refDate is set to the first day of the next month.
	 *
	 * In all cases, the refDate is set to the start of the day (midnight).
	 *
	 * To check whether the DaterRange is generated with a getNext method, access the `isNext` property of a DateRange instance.
	 *
	 * @param dateRange - A DateRange object with a generated range.
	 * @returns The DateRange with generated dates.
	 * @throws an error if DateRange is not provided or the range is not initialized.
	 *
	 * @example
	 * ```
	 * // example with a "WEEK" range
	 * const week = new DateRange().getWeek({ refDate: new Date("2023-01-10") });
	 * week.dateTimes; // dates from Mon, 01/09/2023 to Sun, 01/15/2023
	 *
	 * const weekNext = new DateRange().getNext(week);
	 * weekNext.dateTimes; // dates from Mon, 01/16/2023 to Sun, 01/22/2023
	 * ```
	 */
	public getNext(dateRange: DateRange): DateRange {
		if (dateRange === undefined) {
			throw new MissingArgumentError("dateRange", "DateRange.getNext()");
		}

		if (!(dateRange instanceof DateRange)) {
			throw new InvalidDateRangeError(dateRange);
		}

		// The rangeType property is only defined after the range is initialized,
		// so accessing it before that will throw an error.
		// We use try/catch to catch that error and throw a custom EmptyDateRangeError instead,
		// indicating that the getNext / getPrevious method cannot be used on an empty range.
		try {
			dateRange.rangeType;
		} catch (error) {
			throw new EmptyDateRangeError("getNext method");
		}

		const {
			refDate,
			startOffset,
			endOffset,
			refWeekday,
			rangeType,
			daysCount,
		} = dateRange;

		switch (rangeType) {
			case RANGE_TYPE.Week: {
				const nextRefDate = refDate.startOf("day").plus({ days: 7 });

				const options: Required<OptionsWeek> = {
					refDate: nextRefDate,
					refWeekday: refWeekday,
					startOffset: startOffset,
					endOffset: endOffset,
				};

				this.getWeek(options);
				this._isNext = true;

				return this;
			}
			case RANGE_TYPE.MonthExact: {
				const nextRefDate = refDate.startOf("month").plus({ month: 1 });

				const options: Required<OptionsMonthExact> = {
					refDate: nextRefDate,
					startOffset,
					endOffset,
				};
				this.getMonthExact(options);
				this._isNext = true;

				return this;
			}
			case RANGE_TYPE.MonthExtended: {
				const nextRefDate = refDate.startOf("month").plus({ month: 1 });

				const options: Required<OptionsMonthExtended> = {
					refWeekday,
					refDate: nextRefDate,
					startOffset,
					endOffset,
				};

				this.getMonthExtended(options);
				this._isNext = true;

				return this;
			}
			case RANGE_TYPE.Days: {
				const nextRefDate = refDate.startOf("day").plus({ day: daysCount });

				const options: Required<OptionsDays> = {
					daysCount,
					endOffset,
					startOffset,
					refDate: nextRefDate,
				};

				this.getDays(options);
				this._isNext = true;

				return this;
			}
			default:
				throw new Error("not implemented");
		}
	}

	/**  Generates the previous range based on given one.
	 *
	 * @remarks
	 *
	 * The method takes a DateRange object and based on its range type,
	 * sets the refDate to a date that can generate the new range.
	 *
	 * It copies the options used to adjust the given range and applies them to the new range.
	 *
	 * The method shifts the refDate to the previous one as follows:
	 *   - for a range generated with getDays, the refDate is decremented by the daysCount property.
	 *   - for a range generated with getWeek, the refDate is decremented by 7 days.
	 *   - for a range generated with getMonthExact and getMonthExtended, the refDate is set to the first day of the previous month.
	 *
	 * In all cases, the refDate is set to the start of the day (midnight).
	 *
	 * To check whether the DaterRange is generated with a getPrevious method, access the `isPrevious` property of a DateRange instance.
	 *
	 * @param dateRange - A DateRange object with a generated range range.
	 * @returns The DateRange object with a generated range of the same type and options as the given one but with shifted dates.
	 * @throws an error if DateRange is not provided or the range is not initialized.
	 *
	 * @example
	 * ```
	 * // example with a "WEEK" range
	 * const week = new DateRange().getWeek({ refDate: new Date("2023-01-10") });
	 * week.dateTimes; // dates from Mon, 01/09/2023, to Sun, 01/15/2023
	 *
	 * const weekPrevious = new DateRange().getPrevious(week);
	 * weekPrev.dateTimes; // dates from Mon, 01/02/2023 to Sun, 01/08/2023
	 * ```
	 */
	public getPrevious(dateRange: DateRange) {
		if (dateRange === undefined) {
			throw new MissingArgumentError("dateRange", "DateRange.getPrevious");
		}

		if (!(dateRange instanceof DateRange)) {
			throw new InvalidDateRangeError(dateRange);
		}

		// The rangeType property is only defined after the range is initialized,
		// so accessing it before that will throw an error.
		// We use try/catch to catch that error and throw a custom EmptyDateRangeError instead,
		// indicating that the getNext / getPrevious method cannot be used on an empty range.
		try {
			dateRange.rangeType;
		} catch (error) {
			throw new EmptyDateRangeError("getPrevious method");
		}

		const {
			refDate,
			startOffset,
			endOffset,
			refWeekday,
			rangeType,
			daysCount,
		} = dateRange;

		switch (rangeType) {
			case RANGE_TYPE.Week: {
				const nextRefDate = refDate.startOf("day").minus({ days: 7 });

				const options: Required<OptionsWeek> = {
					refDate: nextRefDate,
					refWeekday: refWeekday,
					startOffset: startOffset,
					endOffset: endOffset,
				};

				this.getWeek(options);
				this._isPrevious = true;

				return this;
			}
			case RANGE_TYPE.MonthExact: {
				const nextRefDate = refDate.startOf("month").minus({ month: 1 });

				const options: Required<OptionsMonthExact> = {
					refDate: nextRefDate,
					startOffset,
					endOffset,
				};
				this.getMonthExact(options);
				this._isPrevious = true;

				return this;
			}
			case RANGE_TYPE.MonthExtended: {
				const nextRefDate = refDate.startOf("month").minus({ month: 1 });

				const options: Required<OptionsMonthExtended> = {
					refWeekday,
					refDate: nextRefDate,
					startOffset,
					endOffset,
				};

				this.getMonthExtended(options);
				this._isPrevious = true;

				return this;
			}
			case RANGE_TYPE.Days: {
				const nextRefDate = refDate.startOf("day").minus({ day: daysCount });

				const options: Required<OptionsDays> = {
					daysCount,
					endOffset,
					startOffset,
					refDate: nextRefDate,
				};

				this.getDays(options);
				this._isPrevious = true;

				return this;
			}
			default:
				throw new Error("not implemented");
		}
	}
}
