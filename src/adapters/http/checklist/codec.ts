import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RR from 'fp-ts/ReadonlyRecord';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as D from '../../../domain/checklist/types';
import { ChecklistResult } from '../../../generated/codec/ChecklistResult';

export const makeChecklistResult = (input: D.ChecklistResult): ChecklistResult =>
  pipe(
    RNEA.fromReadonlyArray(input),
    O.map(
      flow(
        // group by group name
        RNEA.groupBy((result) => result.group.name),
        // transform to array ^^' find a better way
        RR.toReadonlyArray,
        // create the response
        RA.map(([title, results]) => ({ title, results }))
      )
    ),
    O.getOrElse(() => RA.empty)
  );
