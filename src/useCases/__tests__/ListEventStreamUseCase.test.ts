import { ListEventStreamUseCase } from '../ListEventStreamUseCase';
import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import { unauthorizedResponse } from '../../domain/types';

describe('ListEventStreamUseCase', () => {
  it('should return 200', async () => {
    const useCase = ListEventStreamUseCase(data.makeTestSystemEnv([], [], [], [], [], [data.createEventStreamRecord]));

    const actual = await useCase(data.apiKey.valid)();

    expect(actual).toStrictEqual(E.right(data.listEventStreamRecord.output));
  });
  it('should return 403', async () => {
    const useCase = ListEventStreamUseCase(data.makeTestSystemEnv());

    const actual = await useCase('invalid-api-key')();

    expect(actual).toStrictEqual(E.right(unauthorizedResponse));
  });
});
