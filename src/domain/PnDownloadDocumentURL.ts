import { DomainEnv } from './DomainEnv';

export const makePnDownloadDocumentURL = (env: DomainEnv) =>
  `${env.downloadDocumentURL.href}/${env.sampleStaticPdfFileName}?correlation-id=${env.iunGenerator()}`;
