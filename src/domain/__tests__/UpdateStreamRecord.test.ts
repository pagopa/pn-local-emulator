import { EventTypeEnum } from '../../generated/streams/StreamCreationRequest';
import { UpdateStreamRecord, isUpdateStreamRecord, makeUpdateStreamRecord } from '../UpdateStreamRecord';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as data from './data';
import { CreateEventStreamRecord } from '../CreateEventStreamRecord';

describe("makeUpdateStreamRecord", () => {

    it("check if  DeleteStreamRecord is correctly built", () => {
        const expected = {
            type: 'CreateEventStreamRecord',
            input: {
                apiKey: 'key-value',
                body: { title: 'Stream Title', eventType: 'STATUS' },
                streamId: 'ILNK-HRTZ-CRNL-163785-I-2'
              },
              output: {
                statusCode: 200,
                returned: {
                  title: 'Stream Title',
                  eventType: 'STATUS',
                  streamId: 'ILNK-HRTZ-CRNL-163785-I-2',
                  activationDate: data.aDate
                }
              },
              loggedAt: data.aDate
        } as CreateEventStreamRecord;

        const actual = makeUpdateStreamRecord(data.makeTestSystemEnv())({
                apiKey: data.apiKey.valid,
                body: {
                    title: 'Stream Title',
                    eventType: EventTypeEnum.STATUS,
                  },
                streamId: data.streamId.valid
            });

        expect(actual).toEqual(expected);
    });

});


describe("isUpdateStreamRecord", () => {

    it("check if correctly recognises a real UpdateStreamRecord based on type", () => {
        const expected = {
            type: 'UpdateStreamRecord',
            input: {
                apiKey: 'key-value',
                body: { title: 'Stream Title', eventType: 'STATUS' },
                streamId: 'ILNK-HRTZ-CRNL-163785-I-2'
              },
              output: {
                statusCode: 200,
                returned: {
                  title: 'Stream Title',
                  eventType: 'STATUS',
                  streamId: 'ILNK-HRTZ-CRNL-163785-I-2',
                  activationDate: data.aDate
                }
              },
              loggedAt: data.aDate
        } as UpdateStreamRecord;

        const actual: O.Option<UpdateStreamRecord> = isUpdateStreamRecord(expected);

        const valueActual = pipe(
            actual,
            O.fold(
                () => undefined,
                (record) => record
            ) 
        )

        expect(valueActual).toEqual(expected);
    });


    it("check if correctly recognises a fake UpdateStreamRecord based on type", () => {
        const expected = data.getLegalFactDownloadMetadataRecord;

        const actual: O.Option<UpdateStreamRecord> = isUpdateStreamRecord(expected);

        const valueActual = pipe(
            actual,
            O.fold(
                () => undefined,
                (record) => record
            ) 
        )

        expect(valueActual).toEqual(undefined);
    });

});