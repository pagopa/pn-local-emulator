import { CreateEventStreamUseCase } from '../CreateEventStreamUseCase';
import * as E from 'fp-ts/Either';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';
import * as data from '../../domain/__tests__/data';
import { CreateEventStreamRecord } from '../../domain/CreateEventStreamRecordRepository';
import { unauthorizedMessage } from '../../domain/authorize';

describe('CreateEventStreamUseCase', () => {
  it('should return 200', async () => {
    const useCase = CreateEventStreamUseCase(
      inMemory.makeRepository(makeLogger())<CreateEventStreamRecord>([]),
      () => data.createEventStreamResponse.returned.streamId,
      () => data.createEventStreamResponse.returned.activationDate
    );

    const actual = await useCase(data.apiKey.valid)(data.createEventStreamRecord.input.body)();

    expect(actual).toStrictEqual(E.right(data.createEventStreamRecord.output));
  });
  it('should return 403', async () => {
    const useCase = CreateEventStreamUseCase(inMemory.makeRepository(makeLogger())<CreateEventStreamRecord>([]));

    const actual = await useCase('invalid-api-key')(data.createEventStreamRecord.input.body)();

    expect(actual).toStrictEqual(E.right({ statusCode: 403, returned: unauthorizedMessage }));
  });
});
