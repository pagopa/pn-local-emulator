import * as data from './data';
import {
  existsUploadToS3RecordWithSameDocumentKey,
  existsUploadToS3RecordWithSameVersionToken,
  matchAnyPreLoadRecord,
} from '../UploadToS3RecordRepository';

describe('UploadToS3Repository', () => {
  describe('matchAnyPreLoadRecord', () => {
    it('should be true if the two record are related to each other', () => {
      const actual = matchAnyPreLoadRecord([data.preLoadRecord])(data.uploadToS3Record);
      expect(actual).toStrictEqual(true);
    });
    it('should be false if the two record are not related to each other', () => {
      const uploadToS3Record = {
        ...data.uploadToS3Record,
        input: { ...data.uploadToS3Record.input, key: 'another-key' },
      };
      const actual = matchAnyPreLoadRecord([data.preLoadRecord])(uploadToS3Record);
      expect(actual).toStrictEqual(false);
    });
  });

  describe('existsUploadToS3RecordWithSameVersionToken', () => {
    it('should be true if the version token provided matches the record', () => {
      const actual = existsUploadToS3RecordWithSameVersionToken(data.uploadToS3Record.output.returned.toString())(
        data.uploadToS3Record
      );
      expect(actual).toStrictEqual(true);
    });
    it('should be true if the version token provided matches the record', () => {
      const actual = existsUploadToS3RecordWithSameVersionToken('anotherVersionToken')(data.uploadToS3Record);
      expect(actual).toStrictEqual(false);
    });
  });

  describe('existsUploadToS3RecordWithSameDocumentKey', () => {
    it('should be true if the version token provided matches the record', () => {
      const actual = existsUploadToS3RecordWithSameDocumentKey(data.uploadToS3Record.input.key)(data.uploadToS3Record);
      expect(actual).toStrictEqual(true);
    });
    it('should be true if the version token provided matches the record', () => {
      const actual = existsUploadToS3RecordWithSameDocumentKey('anotherDocumentKey')(data.uploadToS3Record);
      expect(actual).toStrictEqual(false);
    });
  });
});
