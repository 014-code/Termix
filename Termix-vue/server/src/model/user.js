const {DataTypes} = require("sequelize");
const sequelize = require("../db");

/**
 * 用户模型-绑定sequelize-ORM框架
 * @author 014
 */
const UserModel = sequelize.define(
    //模型名称
    "User",
    //各类字段定义
    {
        id: {
            //对应数据库字段类型
            type: DataTypes.BIGINT,
            //主键自增
            autoIncrement: true,
            //是否为主键
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            //允许为null
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.INTEGER,
            //默认值0
            defaultValue: 0,
        },
        createTime: {
            type: DataTypes.DATE,
        },
        updateTime: {
            type: DataTypes.DATE,
        },
        isDelete: {
            type: DataTypes.INTEGER,
            //默认值0
            defaultValue: 0,
        }
    },
    {
        //对应数据库表名称
        tableName: "user",
        //是否开启逻辑删除
        paranoid: true,
        //逻辑删除对应字段
        deletedAt: "isDelete",
        // timestamps: true,  // 启用时间戳
        // createdAt: "createTime",  // 创建时间字段
        // updatedAt: "updateTime",  // 更新时间字段
        timestamps: false
    }
);

// 使用钩子自动设置时间
UserModel.beforeCreate((user, options) => {
    const now = new Date();
    user.createTime = now;
    user.updateTime = now;
});

UserModel.beforeUpdate((user, options) => {
    user.updateTime = new Date();
});

module.exports = UserModel;
