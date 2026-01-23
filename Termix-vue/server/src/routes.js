/**
 * 接口路由
 * @author 014
 */
const routes = [
  {
    path: "/user/register",
    handler: require("./controller/userController").userRegisterApi,
  },
  {
    path: "/user/login",
    handler: require("./controller/userController").userLoginApi,
  },
  {
    path: "/user/logout",
    handler: require("./controller/userController").userLogoutApi,
  },
  {
    path: "/user/current",
    handler: require("./controller/userController").getLoginUserApi,
  },
  {
    path: "/music/get",
    handler: require("./controller/musicController").getSingleMusicApi,
  },
  {
    path: "/music/list/hot",
    handler: require("./controller/musicController").getPlaylistDetailApi,
  },
  {
    path: "/fanyi/translate",
    handler: require("./controller/fanyiController").translateApi,
  },
  {
    path: "/background/get/random",
    handler: require("./controller/backgroundController").getRandomBackgroundApi,
  },
  {
    path: "/system/local-ip",
    handler: require("./controller/systemController").getLocalIpApi,
  },
  {
    path: "/system/info",
    handler: require("./controller/systemController").getSysInfoApi,
  },
  {
    path: "/system/process/list",
    handler: require("./controller/systemController").getProcessListApi,
  },
  {
    path: "/system/process/kill",
    handler: require("./controller/systemController").killProcessApi,
  },
];

module.exports = routes;
