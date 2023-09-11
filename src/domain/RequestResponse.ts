import * as t from "io-ts";
import { RequestResponseElement } from "./RequestResponseElement";

export type RequestResponse = t.TypeOf<typeof RequestResponse>;
export const RequestResponse = t.readonlyArray(
  RequestResponseElement,
  "array of RequestResponseElement"
);
