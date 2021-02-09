import { Injectable } from '@angular/core';
import { BaseApi, POST, Body, ApiObservable, BaseUrl, GET, Query } from '../core/http';
import { LoginDto, ArticlesDto, ArticleOneDto } from './dto';

@Injectable({
  providedIn: 'root'
})
// @BaseUrl('/')
export class ModuleService extends BaseApi {
  // constructor(@Inject(Injector) protected injector: Injector) {}

  @POST('/login')
  Login(
    @Body body: LoginDto
  ): ApiObservable<{
    email: string;
    token: string;
  }> {
    return;
  }

  @POST('register')
  Register(
    @Body body: LoginDto
  ): ApiObservable<any> {
    return;
  }

  @GET('/articleOne')
  ArticleOne(): ApiObservable<{ ArticleOneDto }> {
    return;
  }

  @GET('/articlesTable')
  ArticlesTable(
    @Query('pageSize') pageSize: number,
    @Query('pageIndex') pageIndex: number,
    @Query('titleValue') titleValue: string,
    @Query('sourceValue') sourceValue: string,
  ): ApiObservable<{ total: number; articlesList: Array<ArticlesDto> }> {
    return;
  }


  /**
   * 设置收藏与否
   *
   * @param {{ isFavorite: boolean, articleId: string }} body
   * @return {*}  {ApiObservable<any>}
   * @memberof ModuleService
   */
  @POST('/favorite')
  Favorite(
    @Body body: { isFavorite: boolean, articleId: string }
  ): ApiObservable<any> {
    return;
  }

  /**
   * 获取select的列表
   *
   * @return {*}  {ApiObservable<Array<{ _id: string, title: string, url: string }>>}
   * @memberof ModuleService
   */
  @GET('/sources')
  Sources(): ApiObservable<Array<{ _id: string, title: string, url: string }>> {
    return;
  }

  @POST('/asdd')
  Asdd(
    @Body body: { id: string }
  ): ApiObservable<any> {
    return;
  }
}
