import { evaluateReport, Group } from '../reportengine';
import * as RA from 'fp-ts/ReadonlyArray';

describe('evaluateReport', () => {
  it('should evaluate a report without error', () => {
    const report = Group({
      'check 0': Group({
        'check 00': RA.exists((s: string) => s === '00'),
      }),
      'check 1': Group({
        'check 10': RA.exists((s: string) => s === '10'),
        'check 11': RA.exists((s: string) => s === '11'),
      }),
    });
    const actual = evaluateReport(report)(['00', '10']);

    expect(actual).toStrictEqual([
      {
        description: 'check 0',
        children: [
          {
            description: 'check 00',
            result: true,
          },
        ],
      },
      {
        description: 'check 1',
        children: [
          {
            description: 'check 10',
            result: true,
          },
          {
            description: 'check 11',
            result: false,
          },
        ],
      },
    ]);
  });
});
