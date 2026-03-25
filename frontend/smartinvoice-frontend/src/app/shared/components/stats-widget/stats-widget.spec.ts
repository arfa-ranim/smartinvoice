import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsWidget } from './stats-widget';

describe('StatsWidget', () => {
  let component: StatsWidget;
  let fixture: ComponentFixture<StatsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
