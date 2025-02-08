"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memcache_plus_adaptor_1 = require("../memcache-plus-adaptor");
// Jest imports
const globals_1 = require("@jest/globals");
const mockClient = {
    set: jest.fn((key, value, lifetime) => Promise.resolve()),
    get: jest.fn((key) => Promise.resolve({ test: 1 })),
    delete: jest.fn((key) => Promise.resolve()),
};
(0, globals_1.describe)('MemcachePlusAdaptor', () => {
    let adaptor;
    (0, globals_1.beforeEach)(() => {
        adaptor = new memcache_plus_adaptor_1.MemcachePlusAdaptor({ client: mockClient, namespace: 'model', lifetime: 3600 });
    });
    (0, globals_1.test)('should set a value in the cache', async () => {
        const data = { test: 1 };
        const key = ['complex', 'key'];
        await adaptor.set(key, data);
        (0, globals_1.expect)(mockClient.set).toHaveBeenCalledWith('model:complex:key', data, 3600);
    });
    (0, globals_1.test)('should get a value from the cache', async () => {
        const key = ['complex', 'key'];
        const value = await adaptor.get(key);
        (0, globals_1.expect)(mockClient.get).toHaveBeenCalledWith('model:complex:key');
        (0, globals_1.expect)(value).toEqual({ test: 1 });
    });
    (0, globals_1.test)('should delete a value from the cache', async () => {
        const key = ['complex', 'key'];
        await adaptor.del(key);
        (0, globals_1.expect)(mockClient.delete).toHaveBeenCalledWith('model:complex:key');
    });
});
//# sourceMappingURL=memcache-plus-adaptor.test.js.map