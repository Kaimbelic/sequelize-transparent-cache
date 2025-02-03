import { Model, ModelStatic, BuildOptions } from 'sequelize';

function instanceToData(instance: Model): Record<string, any> {
  return instance.get({ plain: true });
}

function dataToInstance(model: ModelStatic<Model>, data: Record<string, any> | null, depth = 1): Model | null {
  if (!data) {
    return null;
  }
  const include = generateIncludeRecurse(model, depth);
  const instance = model.build(data, { isNewRecord: false, raw: false, include } as BuildOptions);
  restoreTimestamps(data, instance);
  return instance;
}

function restoreTimestamps(data: Record<string, any>, instance: Model): void {
  const timestampFields = ['createdAt', 'updatedAt', 'deletedAt'];

  for (const field of timestampFields) {
    const value = data[field];
    if (value) {
      instance.setDataValue(field, new Date(value));
    }
  }

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      try {
        const nestedInstances = instance.get(key) as Model[];
        value.forEach((nestedValue, i) => restoreTimestamps(nestedValue, nestedInstances[i]));
      } catch (error) {
        // TODO: Fix issue with JSON and BLOB columns
      }

      return;
    }

    if (typeof value === 'object') {
      try {
        const nestedInstance = instance.get(key) as Model;
        Object.values(value as Record<string, any>).forEach(nestedValue => restoreTimestamps(nestedValue, nestedInstance));
      } catch (error) {
        // TODO: Fix issue with JSON and BLOB columns
      }
    }
  });
}

function generateIncludeRecurse(model: ModelStatic<Model>, depth = 1, maxDepth = 2): any[] {
  if (depth > maxDepth) {
    return [];
  }
  if (!model.sequelize) {
    return [];
  }
  return Object.entries(model.associations || [])
    .filter(([as, association]) => {
      const hasOptions = Object.prototype.hasOwnProperty.call(association, 'options');
      return hasOptions;
    })
    .map(([as, association]) => {
      const associatedModel = model.sequelize!.model(association.target.name);
      return {
        model: associatedModel,
        include: generateIncludeRecurse(associatedModel, depth + 1, maxDepth),
        as
      };
    });
}

export {
  instanceToData,
  dataToInstance
};
