import path from 'path';
import express from 'express';

export const makeDownloadDocumentRouter = (): express.Router => {
  const router = express.Router();
  router.use('/download', express.static(path.join(__dirname, 'exampledocuments')));

  return router;
};
