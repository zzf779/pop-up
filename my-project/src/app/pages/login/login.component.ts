import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../../core/token/token.service';
import { UserNameService } from "../../core/userName/userName.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModuleService } from '../../api/module.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  validateForm!: FormGroup;// 登录数据
  loginLoading = false; // 登录时加载
  isDisabled = false; // 输入框是否可输入

  constructor(
    private fb: FormBuilder,
    private TokenService: TokenService,
    private UserNameService: UserNameService,
    private message: NzMessageService,
    private router: Router,
    private ModuleService: ModuleService) {
    // 错误提示
    // this.validateForm = this.fb.group({
    //   email: [null,
    //     { value: '', disabled: this.isDisabled },
    //     [Validators.email, Validators.required]
    //   ],
    //   password: [null, { value: '', disabled: this.isDisabled }, [Validators.required]]
    // });
    this.validateForm = new FormGroup({
      email: new FormControl({value: '', disabled: this.isDisabled}, [Validators.email, Validators.required]),
      password: new FormControl({value: '', disabled: this.isDisabled}, Validators.required)
    });
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status == 'VALID') {
      this.loginLoading = true;
      this.isDisabled = true;
      this.ModuleService.Login(this.validateForm.value).subscribe(e => {
        console.log(e);
        this.loginLoading = false;
        this.isDisabled = false;
        if (e.isSuccess) {
          this.TokenService.setToken(e.data.token);
          this.UserNameService.setUser(e.data.email);
          this.message.success(e.msg);
          this.router.navigateByUrl('/home');
        } else {
          this.message.error(e.msg);
        }
      })
    }
  }

  ngOnInit(): void {
    // 错误提示
    // this.validateForm = this.fb.group({
    //   // email: [null,
    //   //   { value: null, disabled: this.isDisabled },
    //   //   [Validators.email, Validators.required]
    //   // ],
    //   // password: [ null, { value: null, disabled: this.isDisabled }, [Validators.required]]
    //   email: [null, [Validators.email, Validators.required]],
    //   password: [null, [Validators.required]],
    // });

    // this.validateForm = new FormGroup({
    //   email: new FormControl({value: '', disabled: this.isDisabled}, [Validators.email, Validators.required]),
    //   password: new FormControl({value: '', disabled: this.isDisabled}, Validators.required)
    // });
  }
}
