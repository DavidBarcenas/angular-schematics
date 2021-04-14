import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaveeproComponent } from './daveepro.component';

describe('DaveeproComponent', () => {
  let component: DaveeproComponent;
  let fixture: ComponentFixture<DaveeproComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaveeproComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaveeproComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
