import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { IconsProviderModule } from './icons-provider.module';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SharedZorroModule } from './shared-zorro.module';
import { LoginGuard } from './login-guard.service';
import { RegisterComponent } from './pages/register/register.component';
// import { NzDemoInputSearchInputComponent } from './pages/home/search.component';
// import { NzDemoFormNormalLoginComponent } from './pages/nz-demo-form-normal-login/nz-demo-form-normal-login.component';
import { SearchComponent } from './pages/search/search.component';
const COMPONENTS = [
  HomeLayoutComponent,
  HomeComponent,
  // NzDemoFormNormalLoginComponent
  LoginComponent,
  SearchComponent,
  RegisterComponent
  // NzDemoInputSearchInputComponent
];

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full', canActivate: [LoginGuard] }, // 为空的时候跳转到home页面
      {
        path: 'home', component: HomeComponent, canActivate: [LoginGuard],
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
             //{path: 'search', component: SearchComponent}
        ]
      }, // home页面
      { path: 'x', component: HomeComponent, canActivate: [LoginGuard] } // xxx页面
    ]
  },
  { path: 'search', 
    component: HomeLayoutComponent,
    children: [
      {path: '', component: SearchComponent}
    ]},
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedZorroModule
  ],
  declarations: [...COMPONENTS],
  exports: [RouterModule, FormsModule]
})
export class AppRoutingModule { }
