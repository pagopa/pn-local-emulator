import { CreateEventStreamUseCase } from '../CreateEventStreamUseCase';
import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import { unauthorizedResponse } from '../../domain/types';

describe('CreateEventStreamUseCase', () => {
  it('should return 200', async () => {
    const useCase = CreateEventStreamUseCase(
      data.makeTestSystemEnv(),
      () => data.createEventStreamResponse.returned.streamId,
      () => data.createEventStreamResponse.returned.activationDate
    );

    const actual = await useCase(data.apiKey.valid)(data.createEventStreamRecord.input.body)();

    expect(actual).toStrictEqual(E.right(data.createEventStreamRecord.output));
  });
  it('should return 403', async () => {
    const useCase = CreateEventStreamUseCase(data.makeTestSystemEnv());

    const actual = await useCase('invalid-api-key')(data.createEventStreamRecord.input.body)();

    expect(actual).toStrictEqual(E.right(unauthorizedResponse));
  });
});
