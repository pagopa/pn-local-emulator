import { fromNumber } from '../Problem';
describe('fromNumber', () => {
  it('check if Problem is correctly built', () => {
    const statusCode = 404;
    const typeExpected = `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${statusCode}-status-code/`;

    const actual = fromNumber(statusCode);

    expect(actual.title).toStrictEqual(statusCode.toString());
    expect(actual.type).toStrictEqual(typeExpected);
  });
});
