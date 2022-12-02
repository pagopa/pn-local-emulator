import { IO } from 'fp-ts/IO';
import { Iun } from '../generated/definitions/Iun';

export type DomainEnv = {
  // envs
  occurrencesAfterComplete: number;
  senderPAId: string;
  downloadDocumentURL: URL;
  sampleStaticPdfFileName: string;
  uploadToS3URL: URL;
  // generators
  iunGenerator: IO<Iun>;
  dateGenerator: IO<Date>;
};
