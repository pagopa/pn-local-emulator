import { IUNGenerator } from '../IUNGenerator';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../../../generated/pnapi/IUN';

describe('IUNGenerator', () => {
  it('should generate valid IUN', () => {
    const actual = pipe(
      RA.makeBy(1000, () => IUNGenerator()),
      RA.map(IUN.decode)
    );
    expect(pipe(actual, RA.every(E.isRight))).toBeTruthy();
  });
});
