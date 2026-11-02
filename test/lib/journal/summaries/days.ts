import { addDays, type ISODate } from "../../../../src/lib/dates";
import { DUE } from "../storyFixtures";

/** Week `w`, day `d` of the fixtures' pregnancy. */
export const on = (w: number, d = 0) => addDays(addDays(DUE, -280), w * 7 + d);
// Thursday of week 30.
export const today = on(30, 3) as ISODate;
