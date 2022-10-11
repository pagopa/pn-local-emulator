import { IO } from 'fp-ts/IO';
import { Iun } from '../generated/definitions/Iun';
import { CheckNotificationStatusRecordRepository } from './CheckNotificationStatusRepository';
import { ConsumeEventStreamRecordRepository } from './ConsumeEventStreamRecordRepository';
import { NewNotificationRepository } from './NewNotificationRepository';

export type SystemEnv = {
  // envs
  occurrencesAfterComplete: number;
  senderPAId: string;
  // generators
  iunGenerator: IO<Iun>;
  dateGenerator: IO<Date>;
  // repositories
  createNotificationRequestRecordRepository: NewNotificationRepository;
  findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository;
  consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository;
};
