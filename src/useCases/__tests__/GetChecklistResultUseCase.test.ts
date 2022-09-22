import { GetChecklistResultUseCase } from '../GetChecklistResultUseCase';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';
import { UploadToS3Record } from '../../domain/UploadToS3RecordRepository';
import * as uploadToS3Checklist from '../../domain/checklist/uploadToS3Checklist';
import * as data from '../../domain/__tests__/data';

const logger = makeLogger();

describe('GetChecklistResultUseCase', () => {
  describe('On upload to S3 request', () => {
    describe('On Exists a response with status code 200 check', () => {
      it('should return "ko" given no uploadToS3 records', async () => {
        // Once the `strict` option on tsoption is enabled
        // and the code refactored then this test can be removed.
        // But until the strict option is false this test is useful
        const { group, name } = uploadToS3Checklist.check0;
        const useCase = GetChecklistResultUseCase(
          inMemory.makeRepository(logger)([data.preLoadRecord]),
          inMemory.makeRepository(logger)<UploadToS3Record>([])
        );
        const actual = await useCase()();
        const actualCheck = pipe(
          actual,
          E.map(RA.filter(({ group: g, name: n }) => g === group && n === name)),
          E.map(RA.map(({ result }) => result))
        );

        expect(actualCheck).toStrictEqual(E.right(['ko']));
      });
    });
  });
});
