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

  // At the moment, the order of the checks is not preserved.
  // The aim of this test is to show this issue.
  // Skip it until we find a way to solve it.
  it.skip('should preserve the order', () => {
    const report = Group({
      "check 2": RA.exists((_) => true),
      "check 1": RA.exists((_) => true),
    });
    expect(evaluateReport(report)([])).toStrictEqual([
      {
        description: 'check 2',
        result: true,
      },
      {
        description: 'check 1',
        result: true,
      },
    ])
  })
});
