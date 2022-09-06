import { NewNotificationRecord } from './NewNotificationRepository';
import { PreLoadRecord } from './PreLoadRepository';
import { UploadToS3Record } from './UploadToS3RecordRepository';

export type AnyRecord = PreLoadRecord | UploadToS3Record | NewNotificationRecord;
