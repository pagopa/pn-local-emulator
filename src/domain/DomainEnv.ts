import { IO } from 'fp-ts/IO';
import { Iun } from '../generated/definitions/Iun';

export type DomainEnv = {
  // envs
  occurrencesAfterComplete: number;
  senderPAId: string;
  // generators
  iunGenerator: IO<Iun>;
  dateGenerator: IO<Date>;
};
