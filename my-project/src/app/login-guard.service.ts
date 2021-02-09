import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from './core/token/token.service'

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private TokenService: TokenService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let isLogin: boolean;
    // 判断用户是否登入
    if (this.TokenService.getToken()) {
      isLogin = true;
    } else {
      isLogin = false;
      this.router.navigateByUrl('/login');
    }
    return isLogin;
  }

}
