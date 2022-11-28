# Testable use cases
Currently, the `PnValidator` allows the emulation and testing of the use cases described down below. As the development proceeds, the list will expand.

## TC-SEND-01
Create a `NotificationRequest` providing two documents, the act to be notified and the pagoPA payment.

1. Request two upload slots.
2. Upload the two documents, act and payment, using the returned slots.
3. Create a notification request carrying the following information:
   - `physicalCommunicationType` filled with `REGISTERED_LETTER_890` value
   - the `recipients` field containing:
      - `taxId`
      - `digitalDomicile`
      - `physicalAddress`
      - `payment` referencing the payment file previously uploaded
   - the `documents` field providing the act file previously uploaded

## TC-SEND-01bis
Create a `NotificationRequest` providing the act to be notified only (no payments are involved).

1. Request an upload slot.
2. Upload the act document using the returned slot.
3. Create a notification request carrying the following information:
    - `physicalCommunicationType` filled with `REGISTERED_LETTER_890` value
    - the `recipients` field containing:
        - `taxId`
        - `digitalDomicile`
        - `physicalAddress`
    - the `documents` field providing the act file previously uploaded

## TC-SEND-02
Create an `EventStream` and consume it until the stream provides one or more notifications with a predefined status.

1. Complete `TC-SEND-01` or `TC-SEND-01bis` use cases with success.
2. Create a new `EventStream` with the `eventType` set to `TIMELINE`.
3. Consume the `EventStream` multiple times until all the conditions are met.
   - The conditions to be met are described in the endpoint that reports the use cases coverage (check [How to use](#how-to-use) section for more information).
