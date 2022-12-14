import * as TE from 'fp-ts/TaskEither';
import { Record, RecordRepository } from '../../domain/Repository';
import { Logger } from '../../logger';

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
        logger.debug(`Record item: ${JSON.stringify(element)}`);
        return TE.of(element);
      },
      list: () => TE.of(store),
    };
  };
