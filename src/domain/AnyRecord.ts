import { PreLoadRecord } from './PreLoadRepository';
import { UploadToS3Record } from './UploadToS3RecordRepository';

export type AnyRecord = UploadToS3Record | PreLoadRecord;
