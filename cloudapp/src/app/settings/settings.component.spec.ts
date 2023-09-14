import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule, CloudAppTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { AppService } from '../app.service';
import { FormGroup } from '@angular/forms';
import { AlertService, CloudAppSettingsService, FormGroupUtil, CloudAppConfigService,
  CloudAppRestService,  RestErrorResponse, } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let translateService: TranslateService;
  let spy: jasmine.Spy;

  let settingsService: CloudAppSettingsService;

  //let valueSettingsServiceSpy: jasmine.SpyObj<CloudAppSettingsService>;

  //const onPageLoadSettings$ = new Settings();

  let settingService = {
    onPageLoad: handler => settingsService.get().subscribe(settings => handler(settings))
  }

  beforeEach(waitForAsync(() => {
    //const spy = jasmine.createSpyObj('CloudAppSettingsService', ['getValue']);

    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, CloudAppTranslateModule.forRoot(), RouterTestingModule ],
      declarations: [ SettingsComponent ],
      providers: [ TranslateService, 
                    { provide: CloudAppSettingsService, useValue: settingsService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);

    //settingsService = fixture.debugElement.injector.get(CloudAppSettingsService);
    fixture.detectChanges();

    let settingsService = TestBed.inject(CloudAppSettingsService) as jasmine.SpyObj<CloudAppSettingsService>;
    spy = spyOn<any>(settingsService, 'get').and.callFake(() => {
          return (SETTINGS_INFO);
      });


    
  });

  it('should create settings', () => {
    expect(component).toBeTruthy();
  });

  it('should use settingsService', () => {
    settingsService = TestBed.inject(CloudAppSettingsService);
    expect(settingsService.getAsFormGroup.toString).toBe([[]]);
  });

  
  const SETTINGS_INFO = {
      "library": "XXX",
      "circ_desc": "YYY",
      "autoSkipUser": false
  }

});

