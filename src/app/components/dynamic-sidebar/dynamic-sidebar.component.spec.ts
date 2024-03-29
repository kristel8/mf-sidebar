import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSidebarComponent } from './dynamic-sidebar.component';

describe('DynamicSidebarComponent', () => {
  let component: DynamicSidebarComponent;
  let fixture: ComponentFixture<DynamicSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
