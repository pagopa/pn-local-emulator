import { existsApiKey } from '../Repository';
import * as data from './data';

describe('Repository', () => {
  it('should contain the api key', () => {
    const actual = existsApiKey(data.preLoadRecord);
    expect(actual).toBeTruthy();
  });
});
