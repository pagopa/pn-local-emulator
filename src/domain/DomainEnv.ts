import { IO } from 'fp-ts/IO';
import { IUN } from '../generated/pnapi/IUN';

export type DomainEnv = {
  // envs
  occurrencesToAccepted: number;
  occurrencesToDelivering: number;
  occurrencesToDelivered: number;
  occurrencesToViewed: number;
  senderPAId: string;
  downloadDocumentURL: URL;
  sampleStaticPdfFileName: string;
  uploadToS3URL: URL;
  retryAfterMs: number;
  notificationPrice: number;
  analogCost: number;
  totalPrice: number;
  partialPrice: number;
  sendFee:number;
  // generators
  iunGenerator: IO<IUN>;
  dateGenerator: IO<Date>;
  uuidGenerator: IO<string>;
};
