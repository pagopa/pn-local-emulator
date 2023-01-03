import { Group } from '../reportengine/reportengine';
import { DomainEnv } from '../DomainEnv';
import * as tcSend01 from './tcSend01';
import * as tcSend01bis from './tcSend01bis';
import * as tcSend02 from './tcSend02';
import * as tcSend03 from './tcSend03';
import * as tcPayment02 from './tcPayment02';

export const report = (env: DomainEnv) =>
  Group({
    'TC-SEND-01': tcSend01.tcSend01,
    'TC-SEND-01bis': tcSend01bis.tcSend01bis,
    'TC-SEND-02': tcSend02.tcSend02(env),
    'TC-SEND-03': tcSend03.tcSend03,
    'TC-PAYMENT-02': tcPayment02.tcPayment02,
  });
