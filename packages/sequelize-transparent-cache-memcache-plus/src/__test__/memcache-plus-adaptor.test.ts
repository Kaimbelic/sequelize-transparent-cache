import { MemcachePlusAdaptor } from '../memcache-plus-adaptor';

// Jest imports
import { describe, expect, test, beforeEach } from '@jest/globals';

const mockClient = {
  set: jest.fn((key, value, lifetime) => Promise.resolve()),
  get: jest.fn((key) => Promise.resolve({ test: 1 })),
  delete: jest.fn((key) => Promise.resolve()),
};

describe('MemcachePlusAdaptor', () => {
  let adaptor: MemcachePlusAdaptor;

  beforeEach(() => {
    adaptor = new MemcachePlusAdaptor({ client: mockClient, namespace: 'model', lifetime: 3600 });
  });

  test('should set a value in the cache', async () => {
    const data = { test: 1 };
    const key = ['complex', 'key'];
    await adaptor.set(key, data);
    expect(mockClient.set).toHaveBeenCalledWith('model:complex:key', data, 3600);
  });

  test('should get a value from the cache', async () => {
    const key = ['complex', 'key'];
    const value = await adaptor.get(key);
    expect(mockClient.get).toHaveBeenCalledWith('model:complex:key');
    expect(value).toEqual({ test: 1 });
  });

  test('should delete a value from the cache', async () => {
    const key = ['complex', 'key'];
    await adaptor.del(key);
    expect(mockClient.delete).toHaveBeenCalledWith('model:complex:key');
  });
});
