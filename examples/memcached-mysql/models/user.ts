import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface UserAttributes {
  id: number;
  name: string;
}

export type UserPk = "id";
export type UserId = User[UserPk];
export type UserOptionalAttributes = "id";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;
  name!: string;

  // timestamps!
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return User.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      sequelize,
      tableName: 'users',
      timestamps: true,
    });
  }
}
