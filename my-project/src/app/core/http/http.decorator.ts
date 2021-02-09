import { Inject, Injector, Injectable } from '@angular/core';

import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

/**
 * API返回类型
 *
 * @export
 * @class ApiObservable
 * @extends {Observable<ApiResponse<T>>}
 * @template T
 */
export class ApiObservable<T> extends Observable<ApiResponse<T>> {}

export class ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  msg: string;
}

/**
 * API服务必须继承
 *
 * @export
 * @abstract
 * @class BaseApi
 */
@Injectable()
export abstract class BaseApi {
  constructor(@Inject(Injector) protected injector: Injector) {}
}

export interface HttpOptions {
  //   /** ACL配置，若导入 `@delon/acl` 时自动有效，等同于 `ACLService.can(roleOrAbility: ACLCanType)` 参数值 */
  //   acl?: any;
  observe?: 'body' | 'events' | 'response';
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  reportProgress?: boolean;
  withCredentials?: boolean;
}

/**
 * 传参类型
 *
 * @interface ParamType
 */
interface ParamType {
  key: string;
  index: number;
  [key: string]: any;
  [key: number]: any;
}

const paramKey = `__api_params`;

/**
 *
 *
 * @param {*} target
 * @param {*} [key=paramKey]
 * @returns
 */
function setParam(target: any, key = paramKey) {
  let params = target[key];
  if (typeof params === 'undefined') {
    params = target[key] = {};
  }
  return params;
}

/**
 * 默认基准URL
 * - 有效范围：类
 *
 * @export
 * @param {string} url
 * @returns
 */
export function BaseUrl(url: string) {
  return function<TClass extends new (...args: any[]) => BaseApi>(
    target: TClass
  ): TClass {
    const params = setParam(target.prototype);
    params.baseUrl = url;
    return target;
  };
}

/**
 * 默认 `headers`
 * - 有效范围：类
 */
export function BaseHeaders(
  headers:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      }
) {
  return function<TClass extends new (...args: any[]) => BaseApi>(
    target: TClass
  ): TClass {
    const params = setParam(target.prototype);
    params.baseHeaders = headers;
    return target;
  };
}

function makeParam(paramName: string) {
  return function(key?: string) {
    return function(target: BaseApi, propertyKey: string, index: number) {
      const params = setParam(setParam(target), propertyKey);
      let tParams = params[paramName];
      if (typeof tParams === 'undefined') {
        tParams = params[paramName] = [];
      }
      tParams.push({
        key,
        index
      });
    };
  };
}

/**
 * URL路由参数
 * - 有效范围：方法参数
 */
export const Path = makeParam('path');

/**
 * URL 参数 `QueryString`
 * - 有效范围：方法参数
 */
export const Query = makeParam('query');

/**
 * 参数 `Body`
 * - 有效范围：方法参数
 */
export const Body = makeParam('body')();

/**
 * 参数 `headers`
 * - 有效范围：方法参数
 * - 合并 `BaseHeaders`
 */
export const Headers = makeParam('headers');

function getValidArgs(data: any, key: string, args: any[]): {} {
  if (!data[key] || !Array.isArray(data[key]) || data[key].length <= 0) {
    return {};
  }
  // console.log(args[data[key][0].index]);
  return args[data[key][0].index];
}

function makeMethod(method: string) {
  return function(url: string = '', options?: HttpOptions) {
    return (
      _target: BaseApi,
      targetKey?: string,
      descriptor?: PropertyDescriptor
    ) => {
      descriptor!.value = function(...args: any[]): Observable<any> {
        options = options || {};

        const http = this.injector.get(HttpService, null) as HttpService;
        if (http == null) {
          throw new TypeError();
          //   throw new TypeError(
          //     `Not found 'HttpService', You can import 'AlainThemeModule' && 'HttpClientModule' in your root module.`
          //   );
        }

        const baseData = setParam(this);
        const data = setParam(baseData, targetKey);

        let requestUrl = url || '';
        requestUrl = [
          baseData.baseUrl || '',
          requestUrl.startsWith('/') ? requestUrl.substr(1) : requestUrl
        ].join('/');
        // fix last split
        if (requestUrl.length > 1 && requestUrl.endsWith('/')) {
          requestUrl = requestUrl.substr(0, requestUrl.length - 1);
        }

        // 权限控制 先关闭
        // if (options.acl) {
        //   const aclSrv: ACLService = this.injector.get(ACLService, null);
        //   if (aclSrv && !aclSrv.can(options.acl)) {
        //     return throwError({
        //       url: requestUrl,
        //       status: 401,
        //       statusText: `From Http Decorator`
        //     });
        //   }
        //   delete options.acl;
        // }

        requestUrl = requestUrl.replace(/::/g, '^^');
        ((data.path as ParamType[]) || [])
          .filter(w => typeof args[w.index] !== 'undefined')
          .forEach((i: ParamType) => {
            requestUrl = requestUrl.replace(
              new RegExp(`:${i.key}`, 'g'),
              encodeURIComponent(args[i.index])
            );
          });
        requestUrl = requestUrl.replace(/\^\^/g, `:`);

        const params = (data.query || []).reduce((p: {}, i: ParamType) => {
          p[i.key] = args[i.index];
          return p;
        }, {});

        const headers = (data.headers || []).reduce((p: {}, i: ParamType) => {
          p[i.key] = args[i.index];
          return p;
        }, {});
        const payload = getValidArgs(data, 'payload', args);
        const supportedBody = method === 'POST' || method === 'PUT';
        const bodyValid = getValidArgs(data, 'body', args);
        return http.request(method, requestUrl, {
          body: Array.isArray(bodyValid)
            ? bodyValid
            : supportedBody
            ? { ...bodyValid, ...payload }
            : null,
          params: !supportedBody ? { ...params, ...payload } : params,
          headers: { ...baseData.baseHeaders, ...headers },
          ...options
        });
      };

      return descriptor;
    };
  };
}

/**
 * `GET` 请求
 * - 有效范围：方法
 */
export const GET = makeMethod('GET');

/**
 * `POST` 请求
 * - 有效范围：方法
 */
export const POST = makeMethod('POST');

/**
 * `DELETE` 请求
 * - 有效范围：方法
 */
export const DELETE = makeMethod('DELETE');

/**
 * `PUT` 请求
 * - 有效范围：方法
 */
export const PUT = makeMethod('PUT');

// /**
//  * `OPTIONS` 请求
//  * - 有效范围：方法
//  */
// export const OPTIONS = makeMethod('OPTIONS');
// /**
//  * `HEAD` 请求
//  * - 有效范围：方法
//  */
// export const HEAD = makeMethod('HEAD');

// /**
//  * `PATCH` 请求
//  * - 有效范围：方法
//  */
// export const PATCH = makeMethod('PATCH');
