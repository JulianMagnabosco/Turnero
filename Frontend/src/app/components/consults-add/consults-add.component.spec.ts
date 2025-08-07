import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultsAddComponent } from './consults-add.component';

describe('ConsultsAddComponent', () => {
  let component: ConsultsAddComponent;
  let fixture: ComponentFixture<ConsultsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultsAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
