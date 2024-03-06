import * as t from 'io-ts';

// required attributes
const RequestResponseElementR = t.interface({
  requestCurl: t.string,
  responseJson: t.string,
});

// optional attributes
const RequestResponseElementO = t.partial({});

export const RequestResponseElement = t.intersection(
  [RequestResponseElementR, RequestResponseElementO],
  'RequestResponseElement'
);

export type RequestResponseElement = t.TypeOf<typeof RequestResponseElement>;
