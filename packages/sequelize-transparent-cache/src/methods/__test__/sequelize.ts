import VariableAdaptor from '../../../../sequelize-transparent-cache-variable/src';
import sequelizeCache from '../..';
import { Sequelize, DataTypes, Model, Optional, Options } from 'sequelize';

const variableAdaptor = new VariableAdaptor();

const options: Options = {
  logging: false,
  dialect: 'sqlite',
  define: {
    paranoid: true
  }
};

const sequelize = new Sequelize(options);

export interface UserAttributes {
  id: number;
  name: string;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;
  name!: string;

  static initModel(sequelize: Sequelize): typeof User {
    return User.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'Users'
    });
  }
}

export interface UserGroupAttributes {
  user_id: number;
  group_id: number;
}

export class UserGroup extends Model<UserGroupAttributes> implements UserGroupAttributes {
  user_id!: number;
  group_id!: number;

  static initModel(sequelize: Sequelize): typeof UserGroup {
    return UserGroup.init({
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'UserGroups'
    });
  }
}

export interface GroupAttributes {
  id: number;
  name: string;
}

export type GroupCreationAttributes = Optional<GroupAttributes, 'id'>;

export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  id!: number;
  name!: string;

  static initModel(sequelize: Sequelize): typeof Group {
    return Group.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'Groups'
    });
  }
}

export interface ArticleAttributes {
  uuid: string;
  title: string;
}

export class Article extends Model<ArticleAttributes> implements ArticleAttributes {
  uuid!: string;
  title!: string;

  static initModel(sequelize: Sequelize): typeof Article {
    return Article.init({
      uuid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'Articles'
    });
  }
}

export interface CommentAttributes {
  userId: number;
  articleUuid: string;
  body: string;
}

export class Comment extends Model<CommentAttributes> implements CommentAttributes {
  userId!: number;
  articleUuid!: string;
  body!: string;

  static initModel(sequelize: Sequelize): typeof Comment {
    return Comment.init({
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      articleUuid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      body: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'Comments'
    });
  }
}

// Initialize models
User.initModel(sequelize);
UserGroup.initModel(sequelize);
Group.initModel(sequelize);
Article.initModel(sequelize);
Comment.initModel(sequelize);

const { withCache } = sequelizeCache(variableAdaptor);
withCache(sequelize.models.User);
withCache(sequelize.models.Article);
withCache(sequelize.models.Comment);
withCache(sequelize.models.Group);

// Define associations
User.hasMany(Article, { as: 'Articles' });
Article.belongsTo(User, { as: 'Author' });
User.belongsToMany(Group, {
  through: UserGroup,
  foreignKey: 'user_id',
  as: 'userGroups'
});
Group.belongsToMany(User, {
  through: UserGroup,
  foreignKey: 'group_id',
  as: 'groupUsers'
});

export default sequelize;
