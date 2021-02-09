import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
    /**
   * 存储KEY值
   */
  store_key = '_token';

  /**
   * 忽略TOKEN的URL地址列表，默认值为：[/\/Login/, /\/SendEmail/, /\/passport/]
   */
  ignores?: RegExp[] | null = [/\/Login/, /\/SendEmail/, /\/passport/];

constructor() { }
/**
   * 保存token
   *
   * @param {string} token
   * @memberof TokenService
   */
  setToken(token: string) {
    sessionStorage.setItem(this.store_key, token);
  }

  /**
   * 获取Token内容
   *
   * @memberof TokenService
   */
  getToken(): string {
    return sessionStorage.getItem(this.store_key);
  }

  /**
   * 清除token
   *
   * @memberof TokenService
   */
  clear() {
    sessionStorage.removeItem(this.store_key);
  }
}
