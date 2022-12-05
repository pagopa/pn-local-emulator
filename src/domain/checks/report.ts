import { Group } from '../reportengine/reportengine';
import * as tcSend01 from './tcSend01';
import * as tcSend01bis from './tcSend01bis';
import * as tcSend02 from './tcSend02';
import * as tcSend03 from './tcSend03';

export const report = Group({
  'TC-SEND-01': tcSend01.tcSend01,
  'TC-SEND-01bis': tcSend01bis.tcSend01bis,
  'TC-SEND-02': tcSend02.tcSend02,
  'TC-SEND-03': tcSend03.tcSend03,
});
