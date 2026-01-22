const {getSingleMusic, getPlaylistDetail} = require("../service/musicService");
const MyError = require("../exception");
const {
    REQUEST_PARAMS_ERROR_CODE,
    NOT_FOUND_ERROR_CODE,
} = require("../exception/errorCode");

async function getSingleMusicApi(event, req) {
    const {keywords} = event;
    if (!keywords) {
        throw new MyError(REQUEST_PARAMS_ERROR_CODE, "请输入关键词");
    }
    const song = await getSingleMusic(keywords);
    if (!song) {
        throw new MyError(NOT_FOUND_ERROR_CODE);
    }
    return {data: {name: song.name, id: song.id}, message: "查询成功"};
}

async function getPlaylistDetailApi(event, req) {
    const songs = await getPlaylistDetail();
    if (!songs) {
        throw new MyError(NOT_FOUND_ERROR_CODE);
    }
    return {data: songs, message: "查询成功"};
}

module.exports = {
    getSingleMusicApi,
    getPlaylistDetailApi,
};
