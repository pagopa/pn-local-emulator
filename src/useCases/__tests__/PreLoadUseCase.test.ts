import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { makeLogger } from '../../logger';
import { PreLoadUseCase } from '../PreLoadUseCase';
import { config } from '../../__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { pipe } from 'fp-ts/lib/function';

const logger = makeLogger();
const repository = inMemory.makeRepository(logger)([]);
const body = [
  {
    preloadIdx: '0',
    contentType: 'application/pdf',
    sha256: 'xxx',
  },
];

describe('PreLoadUseCase', () => {
  it('should return the key into url for each elements', async () => {
    const [apiKey] = ['key-value'];
    const actual = await PreLoadUseCase(logger, config.server.uploadToS3URL, repository)(apiKey)(body)();
    const checkKey = pipe(
      actual,
      E.exists(
        (e) =>
          e.statusCode === 200 &&
          pipe(
            e.returned,
            RA.every((e) => e.url.endsWith(e.key))
          )
      )
    );
    expect(checkKey).toBeTruthy();
  });
});
