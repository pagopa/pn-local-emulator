import * as data from './data';
import {
  existsPreLoadRecordWithSameSha256,
  hasApplicationPdfAsContentType,
  hasUniquePreloadIdx,
} from '../PreLoadRepository';

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

  describe('existsPreLoadRecordWithSameSha256', () => {
    it('should exist a PreLoadRecord with SHA256 provided', () => {
      const actual = existsPreLoadRecordWithSameSha256(data.preLoadRecord.input.body[0].sha256)(data.preLoadRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should not exist a PreLoadRecord with SHA256 provided', () => {
      const actual = existsPreLoadRecordWithSameSha256('notAValidSha')(data.preLoadRecord);
      expect(actual).toStrictEqual(false);
    });
  });
});
