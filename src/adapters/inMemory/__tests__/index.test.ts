import * as i from '../.';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { makeLogger } from '../../../logger';
import * as data from '../../../domain/__tests__/data';
import { makeDeleteStreamRecord } from '../../../domain/DeleteStreamRecord';
import { StreamMetadataResponse } from '../../../generated/pnapi/StreamMetadataResponse';
import { CreateEventStreamRecord } from '../../../domain/CreateEventStreamRecord';

describe('Repository', () => {
  it('should insert the given element', async () => {
    const element = data.preLoadRecord;
    const service = i.makeRecordRepository(makeLogger())([]);

    await service.insert(data.preLoadRecord)();

    const expected = E.right([element]);
    const actual = await service.list()();

    expect(actual).toStrictEqual(expected);
  });

  it('makeDeleteStreamRecord should remove the given element given the same streamId', async () => {
    const element = data.createEventStreamRecord;

    // This has the same input as element above
    const delStreamRec = makeDeleteStreamRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      streamId: data.streamId.valid,
    });

    const service = i.makeRecordRepository(makeLogger())([]);
    await service.insert(element)();

    await service.removeStreamRecord(delStreamRec);

    const actual = await service.list()();
    const expected = E.right([]);

    expect(actual).toStrictEqual(expected);
  });

  it('makeDeleteStreamRecord should not remove the given element if streamId not present', async () => {
    const element = data.createEventStreamRecord;

    // This has the same input as element above
    const delStreamRec = makeDeleteStreamRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      streamId: 'differentStreamId',
    });

    const service = i.makeRecordRepository(makeLogger())([]);
    await service.insert(element)();

    await service.removeStreamRecord(delStreamRec);

    const actual = await service.list()();
    const expected = E.right([element]);

    expect(actual).toStrictEqual(expected);
  });

  it('makeDeleteStreamRecord should remove only a CreateEventStreamRecord', async () => {
    const element = data.consumeEventStreamRecord;

    // This has the same input as element above
    const delStreamRec = makeDeleteStreamRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      streamId: data.streamId.valid,
    });

    const service = i.makeRecordRepository(makeLogger())([]);
    await service.insert(element)();

    await service.removeStreamRecord(delStreamRec);

    const actual = await service.list()();
    const expected = E.right([element]);

    expect(actual).toStrictEqual(expected);
  });

  it('updateStreamRecord should update a previous CreateEventStreamRecord with the new one', async () => {
    const element1 = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    const element2 = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    const toChange = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    (element2.output.returned as StreamMetadataResponse).streamId = 'differentStreamId';

    const service = i.makeRecordRepository(makeLogger())([]);
    await service.insert(element1)();
    await service.insert(element2)();

    await service.updateStreamRecord(toChange);

    const actual = await service.list()();
    const expected = E.right([element2, toChange]);

    expect(actual).toStrictEqual(expected);
  });

  it('updateStreamRecordReturningOnlyTheOneUpdatedStream should return the updated CreateEventStreamRecord', async () => {
    const element1 = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    const element2 = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    const toChange = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    (element2.output.returned as StreamMetadataResponse).streamId = 'differentStreamId';

    const service = i.makeRecordRepository(makeLogger())([]);
    await service.insert(element1)();
    await service.insert(element2)();

    const actual = await service.updateStreamRecordReturningOnlyTheOneUpdatedStream(toChange)();
    const expected = E.right(toChange);

    expect(actual).toStrictEqual(expected);
  });

  it("should return an error in case there wasn't an update on the repository", async () => {
    const element1 = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    const element2 = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    const toChange = JSON.parse(JSON.stringify(data.createEventStreamRecord)) as CreateEventStreamRecord;
    (toChange.output.returned as StreamMetadataResponse).streamId = 'differentStreamId';

    const service = i.makeRecordRepository(makeLogger())([]);
    await service.insert(element1)();
    await service.insert(element2)();

    const actual = await service.updateStreamRecordReturningOnlyTheOneUpdatedStream(toChange)();
    const expected = E.left(new Error('No records were updated.'));

    expect(actual).toStrictEqual(expected);
  });
});
