import * as data from './data';
import { hasApplicationPdfAsContentType, hasUniquePreloadIdx, matchProperties } from '../PreLoadRepository';

describe('PreLoadRepository', () => {
  describe('hasApplicationPdfAsContentType', () => {
    it('should be true that all content types are "application/pdf"', () => {
      const actual = hasApplicationPdfAsContentType(data.preLoadRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should be false that all content types are "application/pdf"', () => {
      const actual = hasApplicationPdfAsContentType({
        ...data.preLoadRecord,
        input: {
          ...data.preLoadRecord.input,
          body: [{ ...data.preLoadRecord.input.body[0], contentType: 'application/json' }],
        },
      });
      expect(actual).toStrictEqual(false);
    });
  });

  describe('hasUniquePreloadIdx', () => {
    it('should be true that request body contain unique preloadIdx', () => {
      const actual = hasUniquePreloadIdx(data.preLoadRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should be false that request body contain unique preloadIdx', () => {
      const actual = hasUniquePreloadIdx({
        ...data.preLoadRecord,
        input: {
          ...data.preLoadRecord.input,
          body: [...data.preLoadRecord.input.body, ...data.preLoadRecord.input.body],
        },
      });
      expect(actual).toStrictEqual(false);
    });
  });

  describe('matchProperties', () => {
    it('should be true if properties have a match', () => {
      const actual = matchProperties(data.aSha256, data.aSecret, data.aKey)(data.preLoadRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should be false if properties do not have a match', () => {
      const actual = matchProperties(
        data.aSha256,
        data.aSecret,
        ''
      )({
        ...data.preLoadRecord,
        input: {
          ...data.preLoadRecord.input,
          body: [...data.preLoadRecord.input.body, ...data.preLoadRecord.input.body],
        },
      });
      expect(actual).toStrictEqual(false);
    });
  });
});
