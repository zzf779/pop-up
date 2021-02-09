import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { TokenService } from '../../core/token/token.service';
import { UserNameService } from "../../core/userName/userName.service";

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.css']
})
export class HomeLayoutComponent implements OnInit {

  userName = '';

  constructor(
    private modal: NzModalService,
    private router: Router,
    private TokenService: TokenService,
    private UserNameService: UserNameService) { }

  logOut() {
    this.modal.confirm({
      nzTitle: '<i>You are leaving the page</i>',
      nzContent: '<b>Please confirm whether to leave the page, you may lose the data that has not been saved.</b>',
      nzOnOk: () => {
        this.TokenService.clear();
        this.UserNameService.clear();
        this.router.navigateByUrl('/login');
      }
    });
  }

  searchPart() {
        this.router.navigateByUrl('/search');
  }

  homePart() {
    this.router.navigateByUrl('/home');
  }

  ngOnInit() {
    this.userName = this.UserNameService.getUser();
  }

}
