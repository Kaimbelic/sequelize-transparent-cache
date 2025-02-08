import Redis from 'ioredis';
import { IORedisAdaptor } from '../io-redis-adaptor';

// Jest imports
import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';

jest.mock('ioredis');

describe('IORedisAdaptor', () => {
  let client: Redis;
  let adaptor: IORedisAdaptor;

  beforeEach(() => {
    client = new Redis();
    adaptor = new IORedisAdaptor({ client, namespace: 'test', lifetime: 60 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should set a value in the cache with a namespace and lifetime', async () => {
    const key = ['key'];
    const value = { foo: 'bar' };
    await adaptor.set(key, value);
    expect(client.set).toHaveBeenCalledWith('test:key', JSON.stringify(value), 'EX', '60');
  });

  test('should get a value from the cache', async () => {
    const key = ['key'];
    const value = { foo: 'bar' };
    client.get = jest.fn().mockResolvedValue(JSON.stringify(value));
    const result = await adaptor.get(key);
    expect(client.get).toHaveBeenCalledWith('test:key');
    expect(result).toEqual(value);
  });

  test('should delete a value from the cache', async () => {
    const key = ['key'];
    await adaptor.del(key);
    expect(client.del).toHaveBeenCalledWith('test:key');
  });
});
