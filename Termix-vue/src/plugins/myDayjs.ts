// @ts-ignore
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
// @ts-ignore
import Duration from "dayjs/plugin/duration";

// 全局设置为中文
dayjs.locale("zh-cn");
dayjs.extend(Duration);

export default dayjs;
