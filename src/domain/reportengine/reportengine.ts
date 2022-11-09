import { pipe } from 'fp-ts/function';
import * as Apply from 'fp-ts/Apply';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RR from 'fp-ts/ReadonlyRecord';
import * as b from 'fp-ts/boolean';

export const Group = Apply.sequenceS(R.Apply);

type ReportIn = { [name: string]: ReportIn | boolean };

export type ReportElement = { description: string; children: Report } | { description: string; result: boolean };

export type Report = ReadonlyArray<ReportElement>;

const convert = (input: ReportIn): Report =>
  pipe(
    RR.keys(input),
    RA.map((key) => ({ key, value: input[key] })),
    RA.map(({ key, value }) =>
      b.isBoolean(value) ? { description: key, result: value } : { description: key, children: convert(value) }
    )
  );

export const evaluateReport = R.map(convert);
