# sequelize-transparent-cache-variable

Variable adaptor for [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache).

Stores sequelize objects in variable. Useful for debugging purposes.

**Warning**: Do not use this adaptor in production, unless you know what you doing.

## Example usage

```typescript
import VariableAdaptor from 'sequelize-transparent-cache-variable';
const variableAdaptor = new VariableAdaptor({
  store: {} // optional
});
```

## Constructor arguments

| Param   | Type   | Required | Description                         |
|---------|--------|----------|-------------------------------------|
| `store` | object | no       | Object to store sequelize instances |

## Storing format
Each object stored as is, keyed by id (Primary Key).

```typescript
adaptor.set(['modelName', 'objectId']);
```
store structure:
```typescript
{
  "modelName": {
    "objectId": {...}
  }
}
```

If object has multiple primary keys, object will be stored as is, keyed
by concatenated Ids separated by comma.

```typescript
adaptor.set(['modelName', 'objectId1', 'objectId2']);
```
store structure will be:
```typescript
{
  "modelName": {
    "objectId1,objectId2": {...}
  }
}
```

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)