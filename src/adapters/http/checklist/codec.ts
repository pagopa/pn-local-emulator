import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RR from 'fp-ts/ReadonlyRecord';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as D from '../../../domain/checklist/types';
import { ChecklistResult } from '../../../generated/codec/ChecklistResult';
import { ResultEnum } from '../../../generated/codec/CheckResult';

const makeResultEnumFromUnion = (input: D.Result['result']): ResultEnum =>
  input === 'ok' ? ResultEnum.ok : ResultEnum.ko;

export const makeChecklistResult = (input: D.ChecklistResult): ChecklistResult =>
  pipe(
    RNEA.fromReadonlyArray(input),
    O.map(
      flow(
        // group by group name
        RNEA.groupBy((result) => result.group.name),
        RR.map(RA.map(({ name, result }) => ({ name, result: makeResultEnumFromUnion(result) }))),
        // transform to array ^^' find a better way
        RR.toReadonlyArray,
        // create the response
        RA.map(([title, results]) => ({ title, results }))
      )
    ),
    RA.fromOption,
    RA.flatten
  );
