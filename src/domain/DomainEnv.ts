import { IO } from 'fp-ts/IO';
import { IUN } from '../generated/pnapi/IUN';

export type DomainEnv = {
  // envs
  occurrencesAfterComplete: number;
  senderPAId: string;
  downloadDocumentURL: URL;
  sampleStaticPdfFileName: string;
  uploadToS3URL: URL;
  // generators
  iunGenerator: IO<IUN>;
  dateGenerator: IO<Date>;
};
