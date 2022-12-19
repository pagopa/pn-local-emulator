import * as IO from 'fp-ts/IO';
import RandExp from 'randexp';
import { IUN } from '../../generated/pnapi/IUN';

export const IUNGenerator: IO.IO<IUN> = () => {
  const iun = new RandExp('^[A-Z]{4}-[A-Z]{4}-[A-Z]{4}-[0-9]{6}-[A-Z]{1}-[0-9]{1}$').gen();
  return iun as IUN;
};
