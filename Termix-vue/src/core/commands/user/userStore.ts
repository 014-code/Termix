import {defineStore} from "pinia";
import {getLoginUser} from "./userApi";
import {LOCAL_USER} from "./userConstant";
import UserType = User.UserType;

/**
 * 用户系统
 */
// @ts-ignore
export const useUserStore = defineStore("user", {
    state: () => ({
        loginUser: {
            ...LOCAL_USER,
        },
    }),
    getters: {},
    // 持久化
    persist: {
        key: "user-store",
        storage: window.localStorage,
        // @ts-ignore
        beforeRestore: (context) => {
            console.log("load userStore data start");
        },
        // @ts-ignore
        afterRestore: (context) => {
            console.log("load userStore data end");
        },
    },
    actions: {
        // @ts-ignore
        async getAndSetLoginUser() {
            const res: any = await getLoginUser();
            if (res?.code === 0 && res.data) {
                this.loginUser = res.data;
            } else {
                console.error("登录失败");
                this.$reset();
            }
        },
        setLoginUser(user: UserType) {
            this.loginUser = user;
        },
    },
});
