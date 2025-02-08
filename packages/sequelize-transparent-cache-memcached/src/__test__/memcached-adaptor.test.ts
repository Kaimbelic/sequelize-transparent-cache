import Memcached from 'memcached';
import { MemcachedAdaptor } from '../memcached-adaptor';

// Jest imports
import { describe, expect, test, beforeEach } from '@jest/globals';

const mockClient = {
  set: jest.fn((key, value, lifetime, callback) => callback(null)),
  get: jest.fn((key, callback) => callback(null, JSON.stringify({ foo: 'bar' }))),
  del: jest.fn((key, callback) => callback(null)),
};

describe('MemcachedAdaptor', () => {
  let adaptor: MemcachedAdaptor;

  beforeEach(() => {
    adaptor = new MemcachedAdaptor({ client: mockClient, namespace: 'test', lifetime: 3600 });
  });

  test('should set a value in the cache', async () => {
    await adaptor.set(['key'], { foo: 'bar' });
    expect(mockClient.set).toHaveBeenCalledWith('test:key', JSON.stringify({ foo: 'bar' }), 3600, expect.any(Function));
  });

  test('should get a value from the cache', async () => {
    const value = await adaptor.get(['key']);
    expect(mockClient.get).toHaveBeenCalledWith('test:key', expect.any(Function));
    expect(value).toEqual({ foo: 'bar' });
  });

  test('should delete a value from the cache', async () => {
    await adaptor.del(['key']);
    expect(mockClient.del).toHaveBeenCalledWith('test:key', expect.any(Function));
  });
});
