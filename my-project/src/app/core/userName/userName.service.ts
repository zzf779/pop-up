import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserNameService {

  constructor() { }
  /**
    * 存储user值
    */
  user_key = '_user';

  /**
   * 保存user
   *
   * @param {string} user
   * @memberof UserNameService
   */
  setUser(user: string) {
    sessionStorage.setItem(this.user_key, user);
  }

  /**
   * 获取user内容
   *
   * @memberof UserNameService
   */
  getUser(): string {
    return sessionStorage.getItem(this.user_key);
  }

  /**
   * 清除user
   *
   * @memberof UserNameService
   */
  clear() {
    sessionStorage.removeItem(this.user_key);
  }
}
