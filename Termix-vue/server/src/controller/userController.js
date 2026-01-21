const {REQUEST_PARAMS_ERROR_CODE} = require("../exception/errorCode");
const MyError = require("../exception");
const {
    userLogin,
    userRegister,
    getLoginUser,
    userLogout,
} = require("../service/userService");
const UserInfoVo = require("../model/vo/userVo");

/**
 * 用户注册
 * @param event
 * @param req
 * @param res
 */
async function userRegisterApi(event, req, res) {
    const {username, password, email} = event;
    if (!username || !password || !email) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
    }
    try {
        return successResponse(res, await userRegister(username, password, email), "注册成功");
    } catch (e) {
        return errorResponse(res, e.code, e.message)
    }
}

/**
 * 用户登录
 * @param event
 * @param req
 * @param res
 */
async function userLoginApi(event, req, res) {
    const {username, password} = event;
    if (!username || !password) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
    }
    try {
        return successResponse(res, await userLogin(username, password, req), "登录成功");
    } catch (e) {
        return errorResponse(res, e.code, e.message)
    }
}

/**
 * 获取当前登录用户信息
 * @param event
 * @param req
 * @param res
 */
async function getLoginUserApi(event, req, res) {
    try {
        const user = await getLoginUser(req);
        const userInfoVo = UserInfoVo.fromModel(user);
        return successResponse(res, userInfoVo, "获取成功");
    } catch (e) {
        return errorResponse(res, e.code, e.message)
    }
}

/**
 * 用户登出
 * @param event
 * @param req
 * @param res
 */
async function userLogoutApi(event, req, res) {
    try {
        await userLogout(req);
        return successResponse(res, true, "登出成功");
    } catch (e) {
        return errorResponse(res, e.code, e.message)
    }
}

module.exports = {
    userRegisterApi,
    userLoginApi,
    getLoginUserApi,
    userLogoutApi,
};
