import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { makeLogger } from '../../logger';
import { PreLoadUseCase } from '../PreLoadUseCase';
import { config } from '../../__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { pipe } from 'fp-ts/lib/function';

// TODO: Remove this hardcoded value; the valid api-key at some point will be taken from envs
const apiKey = 'key-value';
const logger = makeLogger();
const repository = inMemory.makeRepository(logger)([]);
const body = [
  {
    preloadIdx: '0',
    contentType: 'application/pdf',
    sha256: 'sha-value',
  },
];

describe('PreLoadUseCase', () => {
  it('should return the key into url for each elements', async () => {
    const actual = await PreLoadUseCase(logger, config.server.uploadToS3URL, repository)(apiKey)(body)();
    const checkKey = pipe(
      actual,
      E.exists(
        (element) =>
          element.statusCode === 200 &&
          pipe(
            element.returned,
            RA.every((_) => _.url.endsWith(_.key))
          )
      )
    );
    expect(checkKey).toBeTruthy();
  });
});
