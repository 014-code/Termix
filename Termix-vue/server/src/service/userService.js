const MyError = require("../exception");
const {REQUEST_PARAMS_ERROR_CODE, SYSTEM_ERROR_CODE, NOT_LOGIN_ERROR_CODE} = require("../exception/errorCode");
const UserModel = require("../model/user");
const md5 = require("md5");

//盐键
let SALT = '014'


/**
 * 用户注册
 * @param username
 * @param password
 * @param email
 */
async function userRegister(username, password, email) {
    if (!username || !password || !email) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
    }
    if (username > 32) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "用户名过长");
    }
    const regEmail =
        /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (!regEmail.test(email)) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "邮箱非法");
    }
    //是否存在该用户
    let user = await UserModel.findOne({
        where: {
            //拼接or查询
            [Op.or]: [{username}, {email}]
        }
    })
    if (user) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "已存在此用户")
    }
    //插入新用户
    //密码加密
    const newPassword = md5(password + SALT)
    //插入数据
    user = await UserModel.create({
        username: username,
        password: newPassword,
        email: email,
    })
    if (!user) {
        throw new MyError(SYSTEM_ERROR_CODE, "注册失败")
    }
    return user.id
}

/**
 * 用户登录
 * @param username
 * @param password
 * @param req
 */
async function userLogin(username, password, req) {
    if (!username || !password) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
    }
    //加密
    const newPassword = md5(password + SALT)
    //是否存在该用户
    let user = await UserModel.findOne({
        where: {
            //拼接and查询
            [Op.and]: [{username}, {password: newPassword}]
        }
    })
    if (!user) {
        throw new MyError(SYSTEM_ERROR_CODE, "用户不存在或密码错误")
    }
    //设置session登录态
    req.session.userInfo = user
    return user
}

/**
 * 获取当前登录用户信息
 * @param req
 */
async function getLoginUser(req) {
    const user = req.session.userInfo;
    if (!user) {
        throw new MyError(NOT_LOGIN_ERROR_CODE, "未登录");
    }
    return user
}

/**
 * 用户登出
 * @param req
 */
async function userLogout(req) {
    if (req.session.userInfo) {
        req.session.userInfo = null;
    }
    return true;
}

module.exports = {
    userRegister,
    userLogin,
    getLoginUser,
    userLogout,
};