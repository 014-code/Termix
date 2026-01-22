const {translate} = require("../thirdpart/baiduFanYi/baiduFanYiApi");
const MyError = require("../exception");
const {
    REQUEST_PARAMS_ERROR_CODE,
    THIRD_PART_SERVICE_ERROR_CODE,
} = require("../exception/errorCode");

async function translateApi(event, req) {
    const {keywords, config} = event;
    if (!keywords) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "请输入关键词");
    }
    const result = await translate(keywords, config);
    if (!result) {
        throw new MyError(THIRD_PART_SERVICE_ERROR_CODE);
    }
    return {data: result, message: "翻译成功"};
}

module.exports = {
    translateApi,
};
