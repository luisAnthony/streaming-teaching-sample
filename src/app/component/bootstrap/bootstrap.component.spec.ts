import { TestBed, async } from '@angular/core/testing';
import { BootstrapComponent } from './bootstrap.component';
describe('BootstrapComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BootstrapComponent
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(BootstrapComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'rtc-teach-site'`, async(() => {
    const fixture = TestBed.createComponent(BootstrapComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('rtc-teach-site');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(BootstrapComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to rtc-teach-site!');
  }));
});
