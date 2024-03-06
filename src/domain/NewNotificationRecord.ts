/* eslint-disable sonarjs/no-duplicate-string */

import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { NewNotificationResponse } from '../generated/pnapi/NewNotificationResponse';
import { NewNotificationRequestV23 } from '../generated/pnapi/NewNotificationRequestV23';
import { DomainEnv } from './DomainEnv';
import { Record, AuditRecord } from './Repository';
import { HttpErrorMessageBody, Response, UnauthorizedMessageBody } from './types';
import { DeliveryMode } from '../generated/pnapi/DeliveryMode';
import { and } from 'fp-ts/lib/Predicate';
import { VatV23 } from '../generated/pnapi/VatV23';

export type NewNotificationRecord = AuditRecord & {
  type: 'NewNotificationRecord';
  input: { apiKey: string; body: NewNotificationRequestV23 };
  output: Response<202, NewNotificationResponse> | Response<403, UnauthorizedMessageBody> | Response<400, HttpErrorMessageBody>;
};

export const isNewNotificationRecord = (record: Record): O.Option<NewNotificationRecord> =>
  record.type === 'NewNotificationRecord' ? O.some(record) : O.none;
  
export const makeNewNotificationRecord =
  (env: DomainEnv) =>
  (input: NewNotificationRecord['input']): NewNotificationRecord => {
    const isRequestAuthorized = authorizeApiKey(input.apiKey);

    if (!isRequestAuthorized) {
      return {
        type: 'NewNotificationRecord',
        input,
        loggedAt: env.dateGenerator(),
        output: {
          statusCode: 403,
          returned: { message: "Forbidden API key authorization failed" }
        }
      };
    }

    const deliveryModeAndVatValidationResult = pipe(
      // Controllo se la politica della tassa di notifica è DELIVERY_MODE
      input.body.notificationFeePolicy === 'DELIVERY_MODE',
      isDeliveryModePolicy => {
        if (isDeliveryModePolicy) {
          // Se la politica è DELIVERY_MODE, controlla se il campo "vat" non è presente
          if (!input.body.vat) {
            // Se il campo "vat" non è presente, restituisci un errore con codice 400
            return {
              statusCode: 400,
              message: "Errore: Il campo VAT deve essere presente quando è presente il campo Delivery Mode."
            };
          } else {
            // Se il campo "vat" è presente, restituisci una risposta di successo
            return { statusCode: 200, message: "Tutto corretto" };
          }
        } else {
          // Se la politica della tassa di notifica non è DELIVERY_MODE, tutto è corretto
          return { statusCode: 200, message: "Tutto corretto" };
        }
      }
    );
    
    // Simulazione della gestione della risposta HTTP
    const { statusCode, message } = deliveryModeAndVatValidationResult;
    if (statusCode === 400) {
      console.error("Errore:", message);
      // Qui potresti gestire ulteriori azioni, ad esempio inviare una risposta HTTP appropriata al client
    } else {
      console.log(message);
      // Qui potresti gestire ulteriori azioni in caso di successo, ad esempio inviare una risposta HTTP appropriata al client
    }
    
    
    
    const resultFromInputValidation = pipe(
      input.body.notificationFeePolicy === 'FLAT_RATE',
      isFlatRate => {
        if (isFlatRate) {
          return input.body.recipients.some(
              singleRecipient => singleRecipient.payments?.some(singlePayment => singlePayment.f24?.applyCost === true)
            ) || input.body.recipients.some(
              singleRecipient => singleRecipient.payments?.some(singlePayment => singlePayment.pagoPa?.applyCost === true)
            )
            ? E.left({
                statusCode: 400,
                returned: generateErrorResponse(400, "Bad Request", "Invalid request: FLAT_RATE notification cannot have recipients with applyCost set to true"),
              })
            : E.right(generateSuccessfulResponse(env, input));
        } else if (input.body.notificationFeePolicy === 'DELIVERY_MODE') {
          return input.body.recipients.some(
            singleRecipient => singleRecipient.payments?.every(singlePayment => singlePayment.f24?.applyCost === false)
          ) && input.body.recipients.some(
            singleRecipient => singleRecipient.payments?.every(singlePayment => singlePayment.pagoPa?.applyCost === false)
          )
          
            ? E.left({
                statusCode: 400,
                returned: generateErrorResponse(400, "Bad Request", "Invalid request: DELIVERY_MODE notification have no recipients with applyCost set to true"),
              })
            : E.right(generateSuccessfulResponse(env, input));
        } else {
          return E.left(generateErrorResponse(400, "Bad Request", "Invalid notification fee policy"));
        }
      }
    );

    return {
      type: 'NewNotificationRecord',
      input,
      loggedAt: env.dateGenerator(),
      output: E.foldW(
        (error) => error as Response<400, HttpErrorMessageBody>,
        (success ) => ({
          statusCode: 202,
          returned: success,
        }) as Response<202, NewNotificationResponse>
      )(resultFromInputValidation,),
    };
  };

  const authorizeApiKey = (apiKey: string): boolean => apiKey === 'key-value';

  export const generateErrorResponse = (httpStatusCode: number, httpTitle: string, httpMessage: string): HttpErrorMessageBody => ({
    status: httpStatusCode,
    title: httpTitle,
    errors: [],
    detail: httpMessage,
    timestamp: new Date(),
    traceId:
      'Self=1-631b10db-2c591f3f79954187229939e5;Root=1-631b11db-39caf6636f4ed15618461d95;Parent=6e2ef00e703981ac;Sampled=1',
  });
  
  const generateSuccessfulResponse = (env: DomainEnv, input: NewNotificationRecord['input']) => ({
      idempotenceToken: input.body.idempotenceToken,
      paProtocolNumber: input.body.paProtocolNumber,
      notificationRequestId: env.iunGenerator(),
  });