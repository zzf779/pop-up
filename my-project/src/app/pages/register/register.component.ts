import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../../core/token/token.service';
import { UserNameService } from "../../core/userName/userName.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModuleService } from '../../api/module.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css']
})
export class RegisterComponent implements OnInit {

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
    this.validateForm = new FormGroup({
      email: new FormControl({value: '', disabled: this.isDisabled}, [Validators.email, Validators.required]),
      password: new FormControl({value: '', disabled: this.isDisabled}, Validators.required),
      checkPassword: new FormControl({value: '', disabled: this.isDisabled}, [Validators.required, this.confirmationValidator])
    });
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    console.log(this.validateForm.value);
    
    if (this.validateForm.status == 'VALID') {

      this.loginLoading = true;
      this.isDisabled = true;
      this.ModuleService.Register({email:this.validateForm.value.email,password:this.validateForm.value.password}).subscribe(e => {
        console.log(e);
        this.loginLoading = false;
        this.isDisabled = false;
        if (e.isSuccess) {
          this.message.success(e.msg);
          this.router.navigateByUrl('/login');
        } else {
          this.message.error(e.msg);
        }
      })
    }
  }

  ngOnInit() {
  }

}
