"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const memcached_adaptor_1 = require("../memcached-adaptor");
// Jest imports
const globals_1 = require("@jest/globals");
const mockClient = {
    set: jest.fn((key, value, lifetime, callback) => callback(null)),
    get: jest.fn((key, callback) => callback(null, JSON.stringify({ foo: 'bar' }))),
    del: jest.fn((key, callback) => callback(null)),
};
(0, globals_1.describe)('MemcachedAdaptor', () => {
    let adaptor;
    (0, globals_1.beforeEach)(() => {
        adaptor = new memcached_adaptor_1.MemcachedAdaptor({ client: mockClient, namespace: 'test', lifetime: 3600 });
    });
    (0, globals_1.test)('should set a value in the cache', () => __awaiter(void 0, void 0, void 0, function* () {
        yield adaptor.set(['key'], { foo: 'bar' });
        (0, globals_1.expect)(mockClient.set).toHaveBeenCalledWith('test:key', JSON.stringify({ foo: 'bar' }), 3600, globals_1.expect.any(Function));
    }));
    (0, globals_1.test)('should get a value from the cache', () => __awaiter(void 0, void 0, void 0, function* () {
        const value = yield adaptor.get(['key']);
        (0, globals_1.expect)(mockClient.get).toHaveBeenCalledWith('test:key', globals_1.expect.any(Function));
        (0, globals_1.expect)(value).toEqual({ foo: 'bar' });
    }));
    (0, globals_1.test)('should delete a value from the cache', () => __awaiter(void 0, void 0, void 0, function* () {
        yield adaptor.del(['key']);
        (0, globals_1.expect)(mockClient.del).toHaveBeenCalledWith('test:key', globals_1.expect.any(Function));
    }));
});
