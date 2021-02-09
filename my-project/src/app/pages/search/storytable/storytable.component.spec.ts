/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NzDemoTableRowSelectionCustomComponent } from './storytable.component';

describe('NzDemoTableRowSelectionCustomComponent', () => {
  let component: NzDemoTableRowSelectionCustomComponent;
  let fixture: ComponentFixture<NzDemoTableRowSelectionCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NzDemoTableRowSelectionCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NzDemoTableRowSelectionCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
