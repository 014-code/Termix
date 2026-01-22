const {REQUEST_PARAMS_ERROR_CODE} = require("../exception/errorCode");
const MyError = require("../exception");
const {
    userLogin,
    userRegister,
    getLoginUser,
    userLogout,
} = require("../service/userService");
const UserInfoVo = require("../model/vo/userVo");

async function userRegisterApi(event, req) {
    const {username, password, email} = event;
    if (!username || !password || !email) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
    }
    const id = await userRegister(username, password, email);
    return {data: id, message: "注册成功"};
}

async function userLoginApi(event, req) {
    const {username, password} = event;
    if (!username || !password) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
    }
    const user = await userLogin(username, password, req);
    return {data: user, message: "登录成功"};
}

async function getLoginUserApi(event, req) {
    const user = await getLoginUser(req);
    const userInfoVo = UserInfoVo.fromModel(user);
    return {data: userInfoVo, message: "获取成功"};
}

async function userLogoutApi(event, req) {
    await userLogout(req);
    return {data: true, message: "登出成功"};
}

module.exports = {
    userRegisterApi,
    userLoginApi,
    getLoginUserApi,
    userLogoutApi,
};
