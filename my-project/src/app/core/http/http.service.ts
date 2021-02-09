/*
 * @Author: Canaan
 * @Date: 2019-12-07 10:26:20
 * @Last Modified by: Canaan
 * @Last Modified time: 2019-12-07 11:18:20
 */

import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type _HttpHeaders =
  | HttpHeaders
  | { [header: string]: string | string[] };
export type HttpObserve = 'body' | 'events' | 'response';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  /**
   * http请求
   *
   * @readonly
   * @private
   * @memberof HttpService
   */
  private get _httpClient() {
    return this.injector.get(HttpClient);
  }

  /**
   * 是否正在加载中
   *
   * @private
   * @type {boolean}
   * @memberof HttpService
   */
  private _loading: boolean;
  /** 是否正在加载中 */
  get loading(): boolean {
    return this._loading;
  }

  constructor(private injector: Injector) {}

  /**
   * GET 请求
   */
  get<T>(
    url: string,
    params: any,
    options: {
      headers?: _HttpHeaders;
      observe?: 'body' | 'events' | 'response';
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
    } = {}
  ) {
    return this.request<T>('GET', url, {
      params,
      ...options
    });
  }

  /**
   * POST 请求
   *
   * @param {string} url
   * @param {*} body
   * @param {*} params
   * @param {({
   *       headers?: _HttpHeaders;
   *       observe?: 'body' | 'events' | 'response';
   *       reportProgress?: boolean;
   *       responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
   *       withCredentials?: boolean;
   *     })} [options={}]
   * @returns {Observable<any>}
   * @memberof HttpService
   */
  post(
    url: string,
    body: any,
    params: any,
    options: {
      headers?: _HttpHeaders;
      observe?: 'body' | 'events' | 'response';
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
    } = {}
  ): Observable<any> {
    return this.request('POST', url, {
      body,
      params,
      ...options
    });
  }

  /**
   * DELETE 请求
   *
   * @param {string} url
   * @param {*} params
   * @param {({
   *       headers?: _HttpHeaders;
   *       observe?: 'body' | 'events' | 'response';
   *       reportProgress?: boolean;
   *       responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
   *       withCredentials?: boolean;
   *     })} [options={}]
   * @returns {Observable<any>}
   * @memberof HttpService
   */
  delete(
    url: string,
    params: any,
    options: {
      headers?: _HttpHeaders;
      observe?: 'body' | 'events' | 'response';
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
    } = {}
  ): Observable<any> {
    return this.request('DELETE', url, {
      params,
      ...options
    });
  }

  /**
   * PATCH 请求
   *
   * @param {string} url
   * @param {*} body
   * @param {*} params
   * @param {({
   *       headers?: _HttpHeaders;
   *       observe?: 'body' | 'events' | 'response';
   *       reportProgress?: boolean;
   *       responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
   *       withCredentials?: boolean;
   *     })} [options={}]
   * @returns {Observable<any>}
   * @memberof HttpService
   */
  patch(
    url: string,
    body: any,
    params: any,
    options: {
      headers?: _HttpHeaders;
      observe?: 'body' | 'events' | 'response';
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
    } = {}
  ): Observable<any> {
    return this.request('PATCH', url, {
      body,
      params,
      ...options
    });
  }

  /**
   * PUT 请求
   *
   * @param {string} url
   * @param {*} body
   * @param {*} params
   * @param {({
   *       headers?: _HttpHeaders;
   *       observe?: 'body' | 'events' | 'response';
   *       reportProgress?: boolean;
   *       responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
   *       withCredentials?: boolean;
   *     })} [options={}]
   * @returns {Observable<any>}
   * @memberof HttpService
   */
  put(
    url: string,
    body: any,
    params: any,
    options: {
      headers?: _HttpHeaders;
      observe?: 'body' | 'events' | 'response';
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
    } = {}
  ): Observable<any> {
    return this.request('PUT', url, {
      body,
      params,
      ...options
    });
  }

  /**
   * 请求
   *
   * @private
   * @param {string} method
   * @param {string} url
   * @param {({
   *       body?: any;
   *       headers?: _HttpHeaders;
   *       params?: any;
   *       observe?: HttpObserve;
   *       reportProgress?: boolean;
   *       responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
   *       withCredentials?: boolean;
   *     })} [options={}]
   * @memberof HttpService
   */
  request<T>(
    method: string,
    url: string,
    options: {
      body?: any;
      headers?: _HttpHeaders;
      params?: any;
      observe?: HttpObserve;
      reportProgress?: boolean;
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
      withCredentials?: boolean;
    } = {}
  ): Observable<T> {
    this.begin();
    // 处理参数
    if (options.params) {
      options.params = this.parseParams(options.params);
    }
    return this._httpClient.request(method, this.url(url), options).pipe(
      tap(() => this.end()),
      catchError(res => {
        this.end();
        return throwError(res);
      })
    );
  }

  /**
   * 请求开始
   *
   * @memberof HttpService
   */
  private begin() {
    setTimeout(() => (this._loading = true), 10);
  }

  /**
   * 请求结束
   *
   * @memberof HttpService
   */
  private end() {
    setTimeout(() => (this._loading = false), 10);
  }

  /**
   *
   *
   * @private
   * @param {{}} params
   * @returns {HttpParams}
   * @memberof HttpService
   */
  private parseParams(params: {}): HttpParams {
    const newParams = {};
    Object.keys(params).forEach(key => {
      let _data = params[key];
      // 忽略空值
      if (_data == null) return;
      // 将时间转化为：时间戳 (秒)
      if (_data instanceof Date) {
        _data = _data.valueOf();
      }
      newParams[key] = _data;
    });
    return new HttpParams({ fromObject: newParams });
  }

  /**
   * 封装 统一处理url
   *
   * @private
   * @param {string} url
   * @returns
   * @memberof HttpService
   */
  private url(url: string) {
    if (url.startsWith('/')) url = url.substr(1);
    return [environment.apiBaseUrl, url].join('/');
  }
}
