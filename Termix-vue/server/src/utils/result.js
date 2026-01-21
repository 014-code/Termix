// 统一的响应工具
function successResponse(res, data, message = "成功", statusCode = 200) {
    return res.status(statusCode).json({
        code: 0,
        data,
        message
    });
}

function errorResponse(res, code, message, statusCode = 500) {
    return res.status(statusCode).json({
        code: 500,
        message
    });
}