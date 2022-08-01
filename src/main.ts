import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as http from "./adapters/http/application";
import { parseConfig } from "./config";
import { makeLogger } from "./logger";

pipe(
  parseConfig(process.env),
  E.map((config) => {
    const logger = makeLogger();
    // create the driving adapters
    const application = http.makeApplication()
    http.startApplication(logger, config, application)
  }),
  E.fold(
    (error) =>
      console.log(error),
    (_) =>
      _
  )
)
