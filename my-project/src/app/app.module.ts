import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { RouterModule } from '@angular/router';
import { SharedZorroModule } from './shared-zorro.module';
import { INTERCEPTOR_PROVIDES } from './core';
// import { NzDemoTableRowSelectionCustomComponent } from './pages/home/storytable/storytable.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule,
    SharedZorroModule
    // NgZorroAntdModule.forRoot()
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }, ...INTERCEPTOR_PROVIDES],
  bootstrap: [AppComponent],
})
export class AppModule { }
