/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable sonarjs/no-empty-collection */
/* eslint-disable functional/no-let */

import * as IO from 'fp-ts/IO';
import RandExp from 'randexp';
import { IUN } from '../../generated/pnapi/IUN';
// import { makeLogger } from '../../logger';

// const log = makeLogger();
const legalFactsIdsMap: Map<IUN, Map<number, IUN>> = new Map();

export const IUNGenerator: IO.IO<IUN> = () => {
  const iun = new RandExp('^[A-Z]{4}-[A-Z]{4}-[A-Z]{4}-[0-9]{6}-[A-Z]{1}-[0-9]{1}$').gen();
  return iun as IUN;
};

export const IUNGeneratorByIndex = (iunKey: IUN, index: number): IUN => {
  // log.info('Input IUN Key:', iunKey);
  // printLegalFactsIdsMap();

  if (!legalFactsIdsMap.has(iunKey)) {
    legalFactsIdsMap.set(iunKey, new Map());
  }

  const innerMap = legalFactsIdsMap.get(iunKey)!;

  if (!innerMap.has(index)) {
    const iun: IUN = IUNGenerator();
    innerMap.set(index, iun);
    legalFactsIdsMap.set(iunKey, innerMap);
  }

  // printLegalFactsIdsMap();
  return innerMap.get(index)!;
};

/*
export const printLegalFactsIdsMap = () => {
  log.info('Contents of legalFactsIdsMap before:');
  for (const [parentIUN, innerMap] of legalFactsIdsMap.entries()) {
    log.info(`IUN Key: ${parentIUN}`);
    for (const [index, iun] of innerMap.entries()) {
      log.info(`Index: ${index}, IUN: ${iun}`);
    }
  }
};
*/