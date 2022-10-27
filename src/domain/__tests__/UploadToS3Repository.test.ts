import * as data from './data';
import { matchAnyPreLoadRecord } from '../UploadToS3RecordRepository';

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
});
