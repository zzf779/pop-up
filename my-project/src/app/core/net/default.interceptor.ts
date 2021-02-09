/*
 * @Author: Canaan
 * @Date: 2019-12-06 15:41:06
 * @Last Modified by: Canaan
 * @Last Modified time: 2019-12-06 15:51:17
 */

import { Injectable, Injector } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import {
  HttpResponseBase,
  HttpErrorResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HTTP_INTERCEPTORS,
  HttpHeaders
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { TokenService } from '../token/token.service';
import { environment } from 'src/environments/environment';

// 状态码
const CODEMESSAGE = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

@Injectable()
class DefaultInterceptor {
  constructor(private injector: Injector) {}

  /**
   * 获取弹出提示服务
   *
   * @readonly
   * @private
   * @type {NzNotificationService}
   * @memberof NetService
   */
  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  /**
   * token服务
   *
   * @readonly
   * @private
   * @type {TokenService}
   * @memberof DefaultInterceptor
   */
  private get token(): TokenService {
    return this.injector.get(TokenService);
  }

  /**
   * 跳转
   *
   * @private
   * @param {string} url
   * @memberof NetService
   */
  private goTo(url: string) {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  /**
   * 检查状态码
   *
   * @private
   * @param {HttpResponseBase} ev
   * @returns
   * @memberof NetService
   */
  private checkStatus(ev: HttpResponseBase) {
    // 屏蔽掉一些状态码
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }
    // 查找对应的解释
    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    // 弹出提示
    this.notification.error(`请求错误 ${ev.status}: ${ev.url}`, errortext);
  }

  /**
   * 处理http数据
   *
   * @private
   * @param {HttpResponseBase} ev
   * @returns {Observable<any>}
   * @memberof NetService
   */
  private handleData(ev: HttpResponseBase): Observable<any> {
    // 检查状态码
    this.checkStatus(ev);
    // 业务处理：一些通用操作
    switch (ev.status) {
      case 200:
        // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
        // 例如响应内容：
        //  错误内容：{ status: 1, msg: '非法参数' }
        //  正确内容：{ status: 0, response: {  } }
        // 则以下代码片断可直接适用
        // if (event instanceof HttpResponse) {
        //     const body: any = event.body;
        //     if (body && body.status !== 0) {
        //         this.msg.error(body.msg);
        //         // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
        //         // this.http.get('/').subscribe() 并不会触发
        //         return throwError({});
        //     } else {
        //         // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
        //         return of(new HttpResponse(Object.assign(event, { body: body.response })));
        //         // 或者依然保持完整的格式
        //         return of(event);
        //     }
        // }
        break;
      case 401:
        this.notification.error(`未登录或登录已过期，请重新登录。`, ``);
        // 清空 token 信息
        // (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).clear();
        this.goTo('/pages/login');
        break;
      case 403:
      case 404:
      case 500:
        // this.goTo(`/exception/${ev.status}`);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            '未可知错误，大部分是由于后端不支持CORS或无效配置引起',
            ev
          );
        }
        break;
    }
    //
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev);
    } else {
      return of(ev);
    }
  }

  /**
   * 拦截http
   *
   * @param {HttpRequest<any>} req
   * @param {HttpHandler} next
   * @returns {Observable<HttpEvent<any>>}
   * @memberof NetService
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // 统一加上服务端前缀    
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = environment.SERVER_URL + url;
    }
    // 生成一个新的req对象
    const newReq = this.normalizeRequestHeaders(req.clone({ url }));
    // 返回
    return next.handle(newReq).pipe(
      mergeMap((event: any) => {
        // 允许统一对请求错误处理
        if (event instanceof HttpResponseBase) {
          return this.handleData(event);
        }
        // 若一切都正常，则后续操作
        return of(event);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err))
    );
  }

  /**
   * 处理请求的headers
   *
   * @protected
   * @param {HttpRequest<any>} request
   * @returns {HttpRequest<any>}
   * @memberof DefaultInterceptor
   */
  protected normalizeRequestHeaders(
    request: HttpRequest<any>
  ): HttpRequest<any> {
    let modifiedHeaders = request.headers;
    modifiedHeaders = this.addAuthorizationHeaders(request, modifiedHeaders);
    return request.clone({
      headers: modifiedHeaders
    });
  }

  /**
   * 添加认证headers
   *
   * @protected
   * @param {HttpHeaders} headers
   * @returns {HttpHeaders}
   * @memberof DefaultInterceptor
   */
  protected addAuthorizationHeaders(
    request: HttpRequest<any>,
    headers: HttpHeaders
  ): HttpHeaders {
    // 检查
    if (this.token.ignores) {
      for (const item of this.token.ignores as RegExp[]) {
        if (item.test(request.url)) return headers;
      }
    }

    // 向headers中添加Authorization
    let token = this.token.getToken();
    if (!token) {
      token="";
    }

      const key = 'Authorization';
      headers = headers[headers.has(key) ? 'set' : 'append'](
        key,
        token.startsWith('Bearer ') ? token : `Bearer ${token}`
      );

    return headers;
  }
}

// 生成拦截器
export const INTERCEPTOR_PROVIDES = [
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true }
];
