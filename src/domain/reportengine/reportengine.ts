import { flow, pipe } from 'fp-ts/function';
import * as S from 'fp-ts/State';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { AllRecord } from '../Repository';

// TODO: AllRecord could be a generic T
type ReportState = {
  // Keep track the identity of the
  // check that is executing (active) now
  currentCheckId: number;
  // this property contains
  // the final result of each check
  checkResults: Readonly<Record<number, boolean>>;
  // history of all input provided before
  // the current one
  inputHistory: ReadonlyArray<AllRecord>;
};

export const emptyReportState: ReportState = { currentCheckId: 0, checkResults: {}, inputHistory: [] };

// Return the result of the current (active) check
const currentCheckResult = (state: ReportState) => state.checkResults[state.currentCheckId] || false;
// Return a new state with the result of current check updated
const setCurrentCheckResult =
  (result: boolean) =>
  (state: ReportState): ReportState => ({
    ...state,
    checkResults: {
      ...state.checkResults,
      [state.currentCheckId]: result,
    },
  });
// Activate the next check
const activateNextCheck = (state: ReportState): ReportState => ({
  ...state,
  currentCheckId: state.currentCheckId + 1,
});
// Activate the first check
const activateFirstCheck = (state: ReportState): ReportState => ({
  ...state,
  currentCheckId: emptyReportState.currentCheckId,
});
// Record new input
const recordNewInput =
  (input: AllRecord) =>
  (state: ReportState): ReportState => ({
    ...state,
    inputHistory: [...state.inputHistory, input],
  });

// Set the result of the current (active) check
// performing an or with previous result
export const setCheckResult = (result: boolean) =>
  pipe(
    // retrieve the result of active check
    S.gets(currentCheckResult),
    // compute the new result
    S.map((prevResult) => prevResult || result),
    // set the new result
    S.chainFirst((result) => S.modify(setCurrentCheckResult(result))),
    // activate the next check
    S.apFirst(S.modify(activateNextCheck))
  );

export const report = <T>(stateProcessor: (i: AllRecord) => S.State<ReportState, T>) =>
  flow(
    S.traverseArray((input: AllRecord) =>
      pipe(
        // execute the state processor
        stateProcessor(input),
        // add the input just processed
        S.apFirst(S.modify(recordNewInput(input))),
        // activate the first check
        S.apFirst(S.modify(activateFirstCheck))
      )
    )
  );

// Just a wrapper for the State evaluate
export const evaluateReport = flow(
  report,
  // apply the evaluation
  R.map(S.evaluate(emptyReportState)),
  // return only the last result
  R.map(RA.last)
);

// Usage example ////////////////////////////////////////////////////////////

// const useCaseExample = (record: AllRecord) =>
//   Apply.sequenceS(S.Apply)({
//     Test: Apply.sequenceS(S.Apply)({
//       'is a 200': setCheckResult(record.output.statusCode === 200),
//       'is a 403': setCheckResult(record.output.statusCode === 403),
//     }),
//     'is a 202': setCheckResult(record.output.statusCode === 202),
//   });

// evaluateReport(useCaseExample)([...]);
