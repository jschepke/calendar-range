import { WEEKDAY } from "../src/constants";
import { DateTime } from "luxon";
import { test } from "vitest";

type TestValueName =
	| "null"
	| "undefined"
	| "NaN"
	| "Infinity"
	| "empty array []"
	| "empty object {}"
	| "object { a: 1, b: 'foo' }"
	| "integer (1)"
	| "decimal (2.5)"
	| "negative integer (-1)"
	| "negative decimal (-2.5)"
	| "array of integers [1, 2, 3]"
	| "string ('test')"
	| "ISO date string ('2021-12-25')"
	| 'array of strings ["test", "test2"]'
	| "boolean true"
	| "boolean false"
	| "Date object (new Date())"
	| "DateTime object (DateTime.now())";

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
type TestValue = { name: TestValueName; value: any };

const testValues: TestValue[] = [
	{ value: null, name: "null" },
	{ value: undefined, name: "undefined" },
	{ value: NaN, name: "NaN" },
	{ value: Infinity, name: "Infinity" },
	{ value: [], name: "empty array []" },
	{ value: {}, name: "empty object {}" },
	{ value: { a: 1, b: "foo" }, name: "object { a: 1, b: 'foo' }" },
	{ value: 1, name: "integer (1)" },
	{ value: 2.5, name: "decimal (2.5)" },
	{ value: -1, name: "negative integer (-1)" },
	{ value: -2.5, name: "negative decimal (-2.5)" },
	{ value: [1, 2, 3], name: "array of integers [1, 2, 3]" },
	{ value: "test", name: "string ('test')" },
	{ value: "2021-12-25", name: "ISO date string ('2021-12-25')" },
	{ value: ["test", "test2"], name: 'array of strings ["test", "test2"]' },
	{ value: true, name: "boolean true" },
	{ value: false, name: "boolean false" },
	{ value: new Date(), name: "Date object (new Date())" },
	{ value: DateTime.now(), name: "DateTime object (DateTime.now())" },
];

/**
 * Returns an array of test values with different types and values.
 *
 * Optionally filters out some test values by their names.
 *
 * @param valuesToFilter - An optional array of test value names to exclude from the result.
 * @returns An array of test values that match the filter criteria, or all test values if no filter is provided.
 */
function getTestValues(valuesToFilter?: TestValueName[]) {
	if (valuesToFilter === undefined) {
		return testValues;
	} else {
		return testValues.filter(
			(testValue) => !valuesToFilter.includes(testValue.name),
		);
	}
}

// some JS Date objects
const date1 = new Date(); // current date and time
const date2 = new Date(2022, 0, 1); // January 1st, 2022
const date3 = new Date("2021-12-25T12:00:00Z"); // December 25th, 2021 at noon UTC
// invalid JS Date objects
const invalidDate1 = new Date("2023-13-01");
const invalidDate2 = new Date("foo");
const invalidDate3 = new Date(NaN);

// some DateTime objects
const dt1 = DateTime.now(); // current date and time
const dt2 = DateTime.local(2022, 1, 1); // January 1st, 2022 in local time zone
const dt3 = DateTime.fromISO("2021-12-25T12:00:00Z"); // December 25th, 2021 at noon UTC
// invalid DateTime objects
const invalidDt1 = DateTime.invalid("wrong format");
const invalidDt2 = DateTime.fromISO("2021-13-01");

export const invalidInputValues = [
	{ invalidInput: null },
	{ invalidInput: undefined },
	{ invalidInput: NaN },
	{ invalidInput: Infinity },
	{ invalidInput: [] },
	{ invalidInput: {} },
	{ invalidInput: { a: 1, b: "" } },
	{ invalidInput: 1 },
	{ invalidInput: 2.5 },
	{ invalidInput: -1 },
	{ invalidInput: [1] },
	{ invalidInput: "test" },
	{ invalidInput: "2021-12-25" },
	{ invalidInput: ["test"] },
	{ invalidInput: true },
	{ invalidInput: false },
	{ invalidInput: date1 },
	{ invalidInput: dt1 },
];

export const weekdayTestValues = {
	valid: [1, 2, 3, 4, 5, 6, 7],
	invalid: getTestValues(["integer (1)"]),
};

export const isNumberTestValues = {
	valid: [0, 1, -1, 0.5, -0.5],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		{ invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		// { invalidInput: 1 },
		// { invalidInput: 2.5 },
		// { invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
	],
};

export const isEmptyObjectTestValues = {
	valid: [],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		// { invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		{ invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
	],
};

export const isValidRefDateTestValues = {
	valid: [date1, date2, date3, dt1, dt2, dt3],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		{ invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		{ invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
		// { invalidInput: date1 },
		// { invalidInput: dt1 },
		// additional invalid inputs
		{ invalidInput: invalidDate1 },
		{ invalidInput: invalidDate2 },
		{ invalidInput: invalidDate3 },
	],
};

export const isObjectTestValues = {
	valid: [{}, { a: 1, b: "" }],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		// { invalidInput: {} },
		// { invalidInput: { a: 1, b: "" } },
		{ invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
		{ invalidInput: date1 },
		{ invalidInput: dt1 },
	],
};

export const isValidDateTestValues = {
	valid: [date1, date2, date3],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		{ invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		{ invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
		// { invalidInput: date1 },
		// { invalidInput: dt1 },
	],
};
export const isValidDateTimeTestValues = {
	valid: [dt1, dt2, dt3],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		{ invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		{ invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
		{ invalidInput: date1 },
		// { invalidInput: dt1 },
	],
};

export const isValidDateTimeArrayTestValues = {
	valid: [
		{ validInput: [dt1, dt2, dt3] },
		{ validInput: [dt1, dt2] },
		{ validInput: [dt1] },
	],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		{ invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		{ invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
		{ invalidInput: date1 },
		// { invalidInput: dt1 },
		// additional invalid inputs
		{ invalidInput: date2 },
		{ invalidInput: invalidDt1 },
		{ invalidInput: invalidDt2 },
	],
};

export const isValidOffsetTestValues = {
	valid: [0, 1, 123, 10000],
	invalid: [
		{ invalidInput: null },
		{ invalidInput: undefined },
		{ invalidInput: NaN },
		{ invalidInput: Infinity },
		{ invalidInput: [] },
		{ invalidInput: {} },
		{ invalidInput: { a: 1, b: "" } },
		// { invalidInput: 1 },
		{ invalidInput: 2.5 },
		{ invalidInput: -1 },
		{ invalidInput: [1] },
		{ invalidInput: "test" },
		{ invalidInput: "2021-12-25" },
		{ invalidInput: ["test"] },
		{ invalidInput: true },
		{ invalidInput: false },
		{ invalidInput: date1 },
		{ invalidInput: dt1 },
	],
};

interface Assertion {
	refWeekday: WEEKDAY;
	lastWeekday: WEEKDAY;
	firstDate: DateTime | Date;
	lastDate: DateTime | Date;
	numberOfDates: number;
	startOffset?: number;
	endOffset?: number;
}

interface DateRangeTestSet {
	refDate: DateTime;
	assertions: Assertion[];
}

const eachDayOfMonth_refWeekday_testValues: DateRangeTestSet[] = [
	{
		refDate: DateTime.fromObject({ year: 2023, month: 6, day: 4 }),
		assertions: [
			{
				refWeekday: 1,
				lastWeekday: 7,
				firstDate: DateTime.fromObject({ year: 2023, month: 5, day: 29 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 7, day: 2 }),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 2,
				lastWeekday: 1,
				firstDate: DateTime.fromObject({ year: 2023, month: 5, day: 30 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 7, day: 3 }),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 3,
				lastWeekday: 2,
				firstDate: DateTime.fromObject({ year: 2023, month: 5, day: 31 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 7, day: 4 }),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 4,
				lastWeekday: 3,
				firstDate: DateTime.fromObject({ year: 2023, month: 6, day: 1 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 7, day: 5 }),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 5,
				lastWeekday: 4,
				firstDate: DateTime.fromObject({ year: 2023, month: 5, day: 26 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 7, day: 6 }),
				numberOfDates: 6 * 7,
			},
			{
				refWeekday: 6,
				lastWeekday: 5,
				firstDate: DateTime.fromObject({ year: 2023, month: 5, day: 27 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 6, day: 30 }),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 7,
				lastWeekday: 6,
				firstDate: DateTime.fromObject({ year: 2023, month: 5, day: 28 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 7, day: 1 }),
				numberOfDates: 5 * 7,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2022,
			month: 1,
			day: 31,
			hour: 19,
			minute: 58,
			second: 1,
		}),
		assertions: [
			{
				refWeekday: 1,
				lastWeekday: 7,
				firstDate: new Date(2021, 11, 27, 0, 0, 0),
				lastDate: new Date(2022, 1, 6, 0, 0, 0),
				numberOfDates: 6 * 7,
			},
			{
				refWeekday: 2,
				lastWeekday: 1,
				firstDate: new Date(2021, 11, 28, 0, 0, 0),
				lastDate: new Date(2022, 0, 31, 0, 0, 0),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 3,
				lastWeekday: 2,
				firstDate: new Date(2021, 11, 29, 0, 0, 0),
				lastDate: new Date(2022, 1, 1, 0, 0, 0),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 4,
				lastWeekday: 3,
				firstDate: new Date(2021, 11, 30, 0, 0, 0),
				lastDate: new Date(2022, 1, 2, 0, 0, 0),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 5,
				lastWeekday: 4,
				firstDate: new Date(2021, 11, 31, 0, 0, 0),
				lastDate: new Date(2022, 1, 3, 0, 0, 0),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 6,
				lastWeekday: 5,
				firstDate: new Date(2022, 0, 1, 0, 0, 0),
				lastDate: new Date(2022, 1, 4, 0, 0, 0),
				numberOfDates: 5 * 7,
			},
			{
				refWeekday: 7,
				lastWeekday: 6,
				firstDate: new Date(2021, 11, 26, 0, 0, 0),
				lastDate: new Date(2022, 1, 5, 0, 0, 0),
				numberOfDates: 6 * 7,
			},
		],
	},
];

const eachDayOfMonth_refDate_testValues: DateRangeTestSet[] = [
	{
		refDate: DateTime.fromObject({
			year: 2023,
			month: 5,
			day: 17,
			hour: 12,
			minute: 34,
			second: 56,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({
					year: 2023,
					month: 5,
					day: 1,
				}),
				lastDate: DateTime.fromObject({
					year: 2023,
					month: 6,
					day: 4,
				}),
				numberOfDates: 5 * 7,
				refWeekday: 1,
				lastWeekday: 7,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2023,
			month: 12,
			day: 3,
			hour: 23,
			minute: 12,
			second: 34,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 2023, month: 11, day: 27 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 12, day: 31 }),
				numberOfDates: 5 * 7,
				refWeekday: 1,
				lastWeekday: 7,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2010,
			month: 2,
			day: 17,
			hour: 4,
			minute: 34,
			second: 17,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 2010, month: 2, day: 1 }),
				lastDate: DateTime.fromObject({ year: 2010, month: 2, day: 28 }),
				numberOfDates: 4 * 7,
				refWeekday: 1,
				lastWeekday: 7,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2036,
			month: 2,
			day: 17,
			hour: 12,
			minute: 34,
			second: 17,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 2036, month: 1, day: 28 }),
				lastDate: DateTime.fromObject({ year: 2036, month: 3, day: 2 }),
				numberOfDates: 5 * 7,
				refWeekday: 1,
				lastWeekday: 7,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 1905,
			month: 11,
			day: 3,
			hour: 4,
			minute: 45,
			second: 56,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 1905, month: 10, day: 30 }),
				lastDate: DateTime.fromObject({ year: 1905, month: 12, day: 3 }),
				numberOfDates: 5 * 7,
				refWeekday: 1,
				lastWeekday: 7,
			},
		],
	},
];

const eachDayOfMonth_startOffset_testValues: DateRangeTestSet[] = [
	{
		refDate: DateTime.fromObject({
			year: 2023,
			month: 5,
			day: 17,
			hour: 12,
			minute: 34,
			second: 56,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({
					year: 2023,
					month: 4,
					day: 24,
				}),
				lastDate: DateTime.fromObject({
					year: 2023,
					month: 6,
					day: 4,
				}),
				numberOfDates: 5 * 7 + 7,
				refWeekday: 1,
				lastWeekday: 7,
				startOffset: 7,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2023,
			month: 12,
			day: 3,
			hour: 23,
			minute: 12,
			second: 34,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 2023, month: 11, day: 23 }),
				lastDate: DateTime.fromObject({ year: 2023, month: 12, day: 31 }),
				numberOfDates: 5 * 7 + 4,
				refWeekday: 1,
				lastWeekday: 7,
				startOffset: 4,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2010,
			month: 2,
			day: 17,
			hour: 4,
			minute: 34,
			second: 17,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 2010, month: 1, day: 22 }),
				lastDate: DateTime.fromObject({ year: 2010, month: 2, day: 28 }),
				numberOfDates: 4 * 7 + 10,
				refWeekday: 1,
				lastWeekday: 7,
				startOffset: 10,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 2036,
			month: 2,
			day: 17,
			hour: 12,
			minute: 34,
			second: 17,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 2036, month: 1, day: 27 }),
				lastDate: DateTime.fromObject({ year: 2036, month: 3, day: 2 }),
				numberOfDates: 5 * 7 + 1,
				refWeekday: 1,
				lastWeekday: 7,
				startOffset: 1,
			},
		],
	},
	{
		refDate: DateTime.fromObject({
			year: 1905,
			month: 11,
			day: 3,
			hour: 4,
			minute: 45,
			second: 56,
		}),
		assertions: [
			{
				firstDate: DateTime.fromObject({ year: 1905, month: 9, day: 30 }),
				lastDate: DateTime.fromObject({ year: 1905, month: 12, day: 3 }),
				numberOfDates: 5 * 7 + 30,
				refWeekday: 1,
				lastWeekday: 7,
				startOffset: 30,
			},
		],
	},
];

export const eachDayOfMonthTestValues = {
	invalid: {
		arbitraryParams: getTestValues(["undefined"]),
		refDate: getTestValues([
			"undefined",
			"Date object (new Date())",
			"DateTime object (DateTime.now())",
		]),
		refWeekday: getTestValues(["undefined", "integer (1)"]),
		startOffset: getTestValues(["undefined", "integer (1)"]),
		endOffset: getTestValues(["undefined", "integer (1)"]),
	},
	valid: {
		refDate: eachDayOfMonth_refDate_testValues,
		refWeekday: eachDayOfMonth_refWeekday_testValues,
		startOffset: eachDayOfMonth_startOffset_testValues,
		endOffset: "todo",
	},
};
