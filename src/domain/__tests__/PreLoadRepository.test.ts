import * as data from './data';
import {
  documentsHaveSameShaOfPreLoadRecords,
  hasApplicationPdfAsContentType,
  hasUniquePreloadIdx,
  matchProperties,
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

  describe('matchProperties', () => {
    it('should be true if properties have a match', () => {
      const actual = matchProperties(
        data.aSha256,
        data.aSecret,
        data.anAttachmentRef.key,
        data.aSha256
      )(data.preLoadRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should be false if properties do not have a match', () => {
      const actual = matchProperties(
        data.aSha256,
        data.aSecret,
        '',
        data.aSha256
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

  describe('documentsHaveSameShaOfPreLoadRecords', () => {
    const actualFn = documentsHaveSameShaOfPreLoadRecords([data.preLoadRecord]);
    it('should exist a PreLoadRecord with SHA256 provided', () => {
      const actual = actualFn(data.newNotificationRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should not exist a PreLoadRecord with SHA256 provided', () => {
      const anotherNewNotificationRecord = {
        ...data.newNotificationRecord,
        input: {
          ...data.newNotificationRecord.input,
          body: {
            ...data.newNotificationRecord.input.body,
            documents: [{ ...data.newNotificationRecord.input.body.documents[0], digests: { sha256: 'dummySha256' } }],
          },
        },
      };
      const actual = actualFn(anotherNewNotificationRecord);
      expect(actual).toStrictEqual(false);
    });
  });
});
