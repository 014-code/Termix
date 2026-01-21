/**
 * 自定义错误响应实体类
 */
class MyError extends Error {
    //结构体
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
        this.name = "MyError";
    }
}

module.exports = MyError;
