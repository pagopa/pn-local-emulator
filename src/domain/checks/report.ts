import { Group } from '../reportengine/reportengine';
import * as tcSend01 from './tcSend01';
import * as tcSend01bis from './tcSend01bis';

export const report = Group({
  'TC-SEND-01': tcSend01.tcSend01,
  'TC-SEND-01bis': tcSend01bis.tcSend01bis,
});
