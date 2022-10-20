import * as data from './data';
import { contentTypeIsPdf } from '../PreLoadRepository';

describe('PreLoadRepository', () => {
  it('should be true that all content types are "application/pdf"', () => {
    const actual = contentTypeIsPdf(data.preLoadRecord);
    expect(actual).toStrictEqual(true);
  });

  it('should be false that all content types are "application/pdf"', () => {
    const actual = contentTypeIsPdf({
      ...data.preLoadRecord,
      input: {
        ...data.preLoadRecord.input,
        body: [{ ...data.preLoadRecord.input.body[0], contentType: 'application/json' }],
      },
    });
    expect(actual).toStrictEqual(false);
  });
});
