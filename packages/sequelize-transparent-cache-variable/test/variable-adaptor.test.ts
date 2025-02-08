import VariableAdaptor from '../src/variable-adaptor';

// Jest imports
import { describe, expect, test, beforeEach } from '@jest/globals';

describe('VariableAdaptor', () => {
  let adaptor: VariableAdaptor;

  beforeEach(() => {
    adaptor = new VariableAdaptor();
  });

  test('should set and get a value', async () => {
    const model = 'User';
    const id = '1';
    const value = { name: 'John Doe' };

    await adaptor.set([model, id], value);
    const result = await adaptor.get([model, id]);

    expect(result).toEqual(value);
  });

  test('should delete a value', async () => {
    const model = 'User';
    const id = '1';
    const value = { name: 'John Doe' };

    await adaptor.set([model, id], value);
    await adaptor.del([model, id]);
    const result = await adaptor.get([model, id]);

    expect(result).toBeUndefined();
  });

  test('should handle multiple primary keys', async () => {
    const model = 'User';
    const id1 = '1';
    const id2 = '2';
    const value = { name: 'John Doe' };

    await adaptor.set([model, id1, id2], value);
    const result = await adaptor.get([model, id1, id2]);

    expect(result).toEqual(value);
  });
});
