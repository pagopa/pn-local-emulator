import { Group } from '../reportengine/reportengine';
import { DomainEnv } from '../DomainEnv';
import * as tcInvio01 from './tcInvio01';
import * as tcInvio02 from './tcInvio02';
import * as tcInvio03 from './tcInvio03';
import * as tcInvio04 from './tcInvio04';
import * as tcCosto01 from './tcCosto01';

export const report = (env: DomainEnv) =>
  Group({
    'TC-INVIO-01': tcInvio01.tcInvio01,
    'TC-INVIO-02': tcInvio02.tcInvio02,
    'TC-INVIO-03': tcInvio03.tcInvio03(env),
    'TC-INVIO-04': tcInvio04.tcInvio04,
    'TC-COSTO-01': tcCosto01.tcCosto01,
  });
