const {getRandomBackground} = require("../thirdpart/backgroundApi");
const MyError = require("../exception");
const {THIRD_PART_SERVICE_ERROR_CODE} = require("../exception/errorCode");

async function getRandomBackgroundApi(event, req) {
    const result = await getRandomBackground();
    if (!result) {
        throw new MyError(THIRD_PART_SERVICE_ERROR_CODE);
    }
    return {data: result, message: "获取成功"};
}

module.exports = {
    getRandomBackgroundApi,
};
