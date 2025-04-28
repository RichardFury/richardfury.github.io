import { DataTypes } from 'sequelize';

export const Blog = (sequelize) => {
  return sequelize.define('Blog', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    category: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.JSON
    }
  });
};