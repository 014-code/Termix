declare namespace User {
  /**
   * 用户类型
   */
  interface UserType {
    username: string;
    email?: string;
    // @ts-ignore
    createTime?: date;
    // @ts-ignore
    updateTime?: date;
  }
}
