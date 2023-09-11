import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { Record, RecordRepository } from '../../domain/Repository';
import { Logger } from '../../logger';
import { DeleteStreamRecord } from '../../domain/DeleteStreamRecord';
import { CreateEventStreamRecord, isCreateEventStreamRecord } from '../../domain/CreateEventStreamRecord';
import { StreamMetadataResponse } from '../../generated/streams/StreamMetadataResponse';

const filterByStreamId = (streamId: string, record: Record): boolean =>
  O.fold(
    () => true,
    (csr: CreateEventStreamRecord) => (csr.output.returned as StreamMetadataResponse).streamId !== streamId
  )(isCreateEventStreamRecord(record));

// TODO: Instead of mutable variable, try to use the State Monad (or STM)
export const makeRecordRepository =
  (logger: Logger) =>
  (snapshot: ReadonlyArray<Record>): RecordRepository => {
    // TODO: For now we are simulating a database using a mutable variable
    // eslint-disable-next-line functional/no-let
    let store = [...snapshot];
    return {
      insert: (element) => {
        store = [...store, element];
        if (element.type !== 'RequestResponseRecord') {
          logger.debug(`Record item: ${JSON.stringify(element)}`);
        } else {
          logger.debug(`A RequestResponseRecord was recorded. In order to avoid performance issues it is not shown here.`);
        }
        return TE.of(element);
      },
      list: () => TE.of(store),
      removeStreamRecord: (
        deleteEventStreamRecord: DeleteStreamRecord
      ): TE.TaskEither<Error, ReadonlyArray<Record>> => {
        // Filter out DeleteStreamRecord with matching streamId
        const filteredStore = store.filter((record) =>
          filterByStreamId(deleteEventStreamRecord.input.streamId, record)
        );

        store = filteredStore;
        return TE.of(store);
      },
      updateStreamRecord: (
        createEvenStreamRecord: CreateEventStreamRecord
      ): TE.TaskEither<Error, ReadonlyArray<Record>> => {
        // Filter out CreateEventStreamRecord with matching streamId
        const filteredStore = store.filter((record) =>
          filterByStreamId((createEvenStreamRecord.output.returned as StreamMetadataResponse).streamId, record)
        );
        store = [...filteredStore, createEvenStreamRecord];
        return TE.of(store);
      },
      updateStreamRecordReturningOnlyTheOneUpdatedStream: (
        createEvenStreamRecord: CreateEventStreamRecord
      ): TE.TaskEither<Error, CreateEventStreamRecord> => {
        // Filter out CreateEventStreamRecord with matching streamId
        const filteredStore = store.filter((record) =>
          filterByStreamId((createEvenStreamRecord.output.returned as StreamMetadataResponse).streamId, record)
        );
        if (filteredStore.length === store.length) {
          const error = new Error('No records were updated.');
          return TE.left(error);
        } else {
          store = [...filteredStore, createEvenStreamRecord];
          return TE.of(createEvenStreamRecord);
        }
      },
    };
  };
