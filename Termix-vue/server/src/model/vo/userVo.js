/**
 * 用户信息视图对象
 * @author 014
 */
class UserInfoVo {
    constructor() {
        this.id = null;
        this.username = null;
        this.email = null;
        this.status = null;
        this.createTime = null;
        this.updateTime = null;
    }

    /**
     * 将数据库用户模型转换为VO对象
     * @param {Object} userModel - Sequelize用户模型实例
     * @returns {UserInfoVo} 用户信息VO对象
     */
    static fromModel(userModel) {
        if (!userModel) {
            return null;
        }
        const vo = new UserInfoVo();
        vo.id = userModel.id;
        vo.username = userModel.username;
        vo.email = userModel.email;
        vo.status = userModel.status;
        vo.createTime = userModel.createTime;
        vo.updateTime = userModel.updateTime;
        return vo;
    }
}

module.exports = UserInfoVo;
