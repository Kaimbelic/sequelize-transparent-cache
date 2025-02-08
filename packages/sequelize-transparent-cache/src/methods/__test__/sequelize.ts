import VariableAdaptor from '../../../../sequelize-transparent-cache-variable/src';
import sequelizeCache from '../..';
import { Sequelize, DataTypes, Options } from 'sequelize';

const variableAdaptor = new VariableAdaptor();

const options:Options = {
  logging: false,
  dialect: 'sqlite',
  define: {
    paranoid: true
  }
};

const sequelize = new Sequelize(options);

sequelize.define('User', {
  name: {
    allowNull: false,
    type: DataTypes.STRING
  }
});

sequelize.define('UserGroup', {
  user_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  group_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  }
});

sequelize.define('Group', {
  name: {
    allowNull: false,
    type: DataTypes.STRING
  }
});

sequelize.define('Article', {
  uuid: {
    allowNull: false,
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    allowNull: false,
    type: DataTypes.STRING
  }
});

sequelize.define('Comment', {
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  articleUuid: {
    allowNull: false,
    type: DataTypes.STRING,
    primaryKey: true
  },
  body: {
    allowNull: false,
    type: DataTypes.STRING
  }
});

const { withCache } = sequelizeCache(variableAdaptor);
withCache(sequelize.models.User);
withCache(sequelize.models.Article);
withCache(sequelize.models.Comment);
withCache(sequelize.models.Group);

sequelize.model('User').hasMany(sequelize.model('Article'), { as: 'Articles' });
sequelize.model('Article').belongsTo(sequelize.model('User'), { as: 'Author' });
sequelize.model('User').belongsToMany(sequelize.model('Group'), {
  through: {
    model: sequelize.model('UserGroup'),
    unique: false
  },
  foreignKey: 'user_id',
  as: 'userGroups'
});
sequelize.model('Group').belongsToMany(sequelize.model('User'), {
  through: {
    model: sequelize.model('UserGroup'),
    unique: false
  },
  foreignKey: 'group_id',
  as: 'groupUsers'
});

export default sequelize;
