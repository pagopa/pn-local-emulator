import { notFoundResponse } from '../types';

describe('notFoundResponse', () => {
  it('creation of Response as expected', () => {
    const codeErr = 'this is a code error';
    const expectErrors = [
      {
        code: codeErr,
        detail: 'none',
      },
    ];

    const actual = notFoundResponse(codeErr);

    expect(actual.statusCode).toStrictEqual(404);
    expect(actual.returned.errors).toStrictEqual(expectErrors);
    expect(actual.returned.type).toStrictEqual('GENERIC_ERROR');
  });
});
