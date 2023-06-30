import { DateRange } from "../../src/dateRange";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { RANGE_TYPE } from "../../src/constants";
import { EmptyDateRangeError } from "../../src/errors";
import { TestValues } from "../testUtils";
import { DateTime } from "luxon";

const date1 = DateTime.fromObject({
	year: 2021,
	month: 2,
	day: 1,
	hour: 12,
	minute: 59,
});
const date2 = DateTime.fromObject({
	year: 2001,
	month: 5,
	day: 7,
	hour: 2,
	minute: 3,
});
const date3 = DateTime.fromObject({
	year: 2010,
	month: 2,
	day: 1,
	hour: 15,
	minute: 32,
});

describe("getNext method", () => {
	describe("Input validation", () => {
		describe("Given no arguments to the function", () => {
			test("throws an errors", () => {
				// @ts-expect-error: testing invalid input
				expect(() => new DateRange().getNext()).toThrowError("Missing");
			});
		});
		describe("Given invalid arguments to the function", () => {
			test.each(new TestValues().excludeByName(["undefined"]))(
				"throws an error for argument: $name",
				({ value }) => {
					expect(() => new DateRange().getNext(value)).toThrowError(
						"The value of the dateRange parameter is invalid.",
					);
				},
			);
		});
		describe("Given an empty DateRange object to the function", () => {
			test("throws the 'EmptyDateRangeError", () => {
				const dr = new DateRange();
				expect(() => new DateRange().getNext(dr)).toThrowError(
					new EmptyDateRangeError("getNext method"),
				);
			});
		});

		describe("Functionality", () => {
			const dateRange = new DateRange();

			// set mocked time
			beforeEach(() => {
				vi.useFakeTimers();
				vi.setSystemTime(date1.toJSDate());
			});

			// restoring date after each test run
			afterEach(() => {
				vi.useRealTimers();
			});

			test("throws an error if the RangeType is not valid", () => {
				// mock a setter method 'rangeType' to prototype of DateRange
				Object.defineProperty(DateRange.prototype, "rangeType", {
					set(value) {
						this._rangeType = value;
					},
				});
				const dr = new DateRange().getDays();

				// @ts-ignore
				dr.rangeType = "invalid";
				expect(() => new DateRange().getNext(dr)).toThrowError(
					"not implemented",
				);
			});

			describe(`with DateRange of type ${RANGE_TYPE.Days}`, () => {
				describe.each([
					new DateRange().getDays(),
					new DateRange().getDays({
						refDate: date1,
						daysCount: 10,
						endOffset: 5,
						startOffset: 5,
					}),
					new DateRange().getDays({
						daysCount: 999,
						refDate: date2,
						endOffset: 100,
						startOffset: 100,
					}),
				])("test index: %#", (dr) => {
					test("has the same number of dates", () => {
						// const next = new DateRange().getNext(dr);
						const next = dateRange.getNext(dr);
						expect(next.dateTimes.length).toBe(dr.dateTimes.length);
					});

					test("has correct refDate", () => {
						// const next = new DateRange().getNext(dr);
						const next = dateRange.getNext(dr);
						expect(next.refDate.toISO()).toBe(
							dr.refDate.startOf("day").plus({ days: dr.daysCount }).toISO(),
						);
					});

					test("has correct first date", () => {
						const drNext = new DateRange().getNext(dr);

						expect(drNext.dateTimes[0].toISODate()).toBe(
							dr.dateTimes[0].plus({ days: dr.daysCount }).toISODate(),
						);
					});

					test("each date of the range is the next day after the previous day", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i].toISO()).toBe(
								dateTimes[i - 1].plus({ day: 1 }).toISO(),
							);
						}
					});

					test("each date of the range is a valid luxon DateTime", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i]).instanceOf(DateTime);
							expect(dateTimes[i].isValid).toBe(true);
						}
					});

					test("rangeType after calling the getNext method is set to 'DAYS' (with a new instance)", () => {
						const drNext = new DateRange().getNext(dr);
						expect(drNext.rangeType).toBe(RANGE_TYPE.Days);
					});

					test("rangeType after calling the getNext method is set to 'DAYS' (with a previously generated instance)", () => {
						// generate a week range
						const drWeek = new DateRange().getWeek();
						expect(drWeek.rangeType).toBe(RANGE_TYPE.Week);
						// assign a new range with getNext method
						drWeek.getNext(dr);
						expect(drWeek.rangeType).toBe(RANGE_TYPE.Days);
					});
				});
			});

			describe(`with DateRange of type ${RANGE_TYPE.Week}`, () => {
				describe.each([
					new DateRange().getWeek(),
					new DateRange().getWeek({
						refDate: date1,
						endOffset: 5,
						startOffset: 5,
						refWeekday: 4,
					}),
					new DateRange().getWeek({
						refDate: date2,
						endOffset: 3,
						startOffset: 3,
						refWeekday: 2,
					}),
					new DateRange().getWeek({
						refDate: date2,
						endOffset: 30,
						startOffset: 30,
						refWeekday: 2,
					}),
				])("test index: %#", (dr) => {
					test("has the same number of dates", () => {
						const next = new DateRange().getNext(dr);
						expect(next.dateTimes.length).toBe(dr.dateTimes.length);
					});

					test("has correct refDate", () => {
						const next = new DateRange().getNext(dr);
						expect(next.refDate.toISO()).toBe(
							dr.refDate.startOf("day").plus({ days: 7 }).toISO(),
						);
					});

					test("has correct first date", () => {
						const drNext = new DateRange().getNext(dr);

						expect(drNext.dateTimes[0].toISODate()).toBe(
							dr.dateTimes[0].plus({ days: 7 }).toISODate(),
						);
					});

					test("each date of the range is the next day after the previous day", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i].toISO()).toBe(
								dateTimes[i - 1].plus({ day: 1 }).toISO(),
							);
						}
					});

					test("each date of the range is a valid luxon DateTime", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i]).instanceOf(DateTime);
							expect(dateTimes[i].isValid).toBe(true);
						}
					});

					test(`rangeType after calling the getNext method is set to '${RANGE_TYPE.Week}' (with a new instance)`, () => {
						const drNext = new DateRange().getNext(dr);
						expect(drNext.rangeType).toBe(RANGE_TYPE.Week);
					});

					test(`rangeType after calling the getNext method is set to '${RANGE_TYPE.Week}' (with a previously generated instance)`, () => {
						// generate a some range
						const drMonth = new DateRange().getMonthExtended();
						expect(drMonth.rangeType).toBe(RANGE_TYPE.MonthExtended);
						// assign a new range with getNext method
						drMonth.getNext(dr);
						expect(drMonth.rangeType).toBe(RANGE_TYPE.Week);
					});
				});
			});

			describe(`with DateRange of type ${RANGE_TYPE.MonthExtended}`, () => {
				describe.each([
					new DateRange().getMonthExtended(),
					new DateRange().getMonthExtended({
						refDate: date1,
						endOffset: 5,
						startOffset: 5,
						refWeekday: 4,
					}),
					new DateRange().getMonthExtended({
						refDate: date2,
						endOffset: 3,
						startOffset: 3,
						refWeekday: 2,
					}),
					new DateRange().getMonthExtended({
						refDate: date2,
						endOffset: 30,
						startOffset: 30,
						refWeekday: 2,
					}),
					new DateRange().getMonthExtended({
						refDate: date3,
					}),
				])("test index: %#", (dr) => {
					test("has correct refDate", () => {
						const next = new DateRange().getNext(dr);
						expect(next.refDate.toISO()).toBe(
							dr.refDate.startOf("month").plus({ month: 1 }).toISO(),
						);
					});

					test("before the offset the first date of the range is refWeekday", () => {
						const drNext = new DateRange().getNext(dr);

						expect(
							drNext.dateTimes[0].plus({ days: dr.startOffset }).weekday,
						).toBe(dr.refWeekday);
					});

					test("before the offset the last date of the range is weekday preceding the refWeekday", () => {
						const drNext = new DateRange().getNext(dr);

						expect(
							drNext.dateTimes[drNext.dateTimes.length - 1].minus({
								days: dr.endOffset,
							}).weekday,
						).toBe(
							// get the weekday preceding the refWeekday
							dr.refWeekday - 1 >= 1 ? dr.refWeekday - 1 : dr.refWeekday + 6,
						);
					});

					test("each date of the range is the next day after the previous day", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i].toISO()).toBe(
								dateTimes[i - 1].plus({ day: 1 }).toISO(),
							);
						}
					});

					test("each date of the range is a valid luxon DateTime", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i]).instanceOf(DateTime);
							expect(dateTimes[i].isValid).toBe(true);
						}
					});

					test(`rangeType after calling the getNext method is set to '${RANGE_TYPE.MonthExtended}' (with a new instance)`, () => {
						const drNext = new DateRange().getNext(dr);
						expect(drNext.rangeType).toBe(RANGE_TYPE.MonthExtended);
					});

					test(`rangeType after calling the getNext method is set to '${RANGE_TYPE.MonthExtended}' (with a previously generated instance)`, () => {
						// generate a some range
						const drDays = new DateRange().getDays();
						expect(drDays.rangeType).toBe(RANGE_TYPE.Days);
						// assign a new range with getNext method
						drDays.getNext(dr);
						expect(drDays.rangeType).toBe(RANGE_TYPE.MonthExtended);
					});
				});
			});

			describe(`with DateRange of type ${RANGE_TYPE.MonthExact}`, () => {
				describe.each([
					new DateRange().getMonthExact(),
					new DateRange().getMonthExact({
						refDate: date1,
						endOffset: 5,
						startOffset: 5,
					}),
					new DateRange().getMonthExact({
						refDate: date2,
						endOffset: 3,
						startOffset: 3,
					}),
					new DateRange().getMonthExact({
						refDate: date2,
						endOffset: 30,
						startOffset: 30,
					}),
					new DateRange().getMonthExact({
						refDate: date3,
					}),
				])("test index: %#", (dr) => {
					test("has correct refDate", () => {
						const next = new DateRange().getNext(dr);
						expect(next.refDate.toISO()).toBe(
							dr.refDate.startOf("month").plus({ month: 1 }).toISO(),
						);
					});

					test("before the offset the first date of the range is the first day of month", () => {
						const drNext = new DateRange().getNext(dr);

						expect(
							drNext.dateTimes[0].plus({ days: dr.startOffset }).toISO(),
						).toBe(drNext.refDate.toISO());
					});

					test("before the offset the last date of the range is the last day of month", () => {
						const drNext = new DateRange().getNext(dr);

						expect(
							drNext.dateTimes[drNext.dateTimes.length - 1]
								.minus({
									days: dr.endOffset,
								})
								.toISO(),
						).toBe(drNext.refDate.endOf("month").startOf("day").toISO());
					});

					test("each date of the range is the next day after the previous day", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i].toISO()).toBe(
								dateTimes[i - 1].plus({ day: 1 }).toISO(),
							);
						}
					});

					test("each date of the range is a valid luxon DateTime", () => {
						const drNext = new DateRange().getNext(dr);
						const { dateTimes } = drNext;

						for (let i = 1; i < dateTimes.length; i++) {
							expect(dateTimes[i]).instanceOf(DateTime);
							expect(dateTimes[i].isValid).toBe(true);
						}
					});

					test(`rangeType after calling the getNext method is set to '${RANGE_TYPE.MonthExact}' (with a new instance)`, () => {
						const drNext = new DateRange().getNext(dr);
						expect(drNext.rangeType).toBe(RANGE_TYPE.MonthExact);
					});

					test(`rangeType after calling the getNext method is set to '${RANGE_TYPE.MonthExact}' (with a previously generated instance)`, () => {
						// generate a some range
						const drDays = new DateRange().getDays();
						expect(drDays.rangeType).toBe(RANGE_TYPE.Days);
						// assign a new range with getNext method
						drDays.getNext(dr);
						expect(drDays.rangeType).toBe(RANGE_TYPE.MonthExact);
					});
				});
			});
		});
	});
});
