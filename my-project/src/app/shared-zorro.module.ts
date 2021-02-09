import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

export const SHARED_ZORRO_MODULES = [
  NzLayoutModule,
  NzMenuModule,
  NzTableModule,
  NzButtonModule,
  NzGridModule,
  NzBadgeModule,
  NzCardModule,
  NzAffixModule,
  NzDrawerModule,
  NzAvatarModule,
  NzSelectModule,
  NzTagModule,
  NzFormModule,
  NzMessageModule,
  NzSkeletonModule,
  NzModalModule,
  NzNotificationModule,
  NzDropDownModule
];

@NgModule({
  imports: [
    CommonModule,
    ...SHARED_ZORRO_MODULES,
  ],
  declarations: [],
  exports: [
    ...SHARED_ZORRO_MODULES,
  ]
})

export class SharedZorroModule { }
