import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../app.service';
import { Component, Injectable } from '@angular/core';
import { InitService, AlertModule, MenuModule, CloudAppTranslateModule } from '@exlibris/exl-cloudapp-angular-lib';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppRoutingModule } from '../app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { By } from '@angular/platform-browser'

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

@Component({
  template: `<input type="text" [(ngModel)]="barcode"/>`
})
class TestComponent {
  barcode = '';
}


describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let restService: CloudAppRestService;
  let spy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        //BrowserAnimationsModule,
        //FormsModule,
        //ReactiveFormsModule,
        //MaterialModule,
        RouterTestingModule,
        //AppService,
        //ToastrService,
        //TranslateService,
        //Injectable,
        //InitService, BehaviorSubject, Observable,
    //BrowserModule,
    //BrowserAnimationsModule,
    //AppRoutingModule,
    //HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    //SelectEntitiesModule,
    MenuModule,
    CloudAppTranslateModule.forRoot(),
    
    getToastrModule(),

      ],
      declarations: [ MainComponent, TestComponent],
      providers:[CloudAppRestService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;

    restService = fixture.debugElement.injector.get(CloudAppRestService);
    spy = spyOn<any>(restService, 'call').and.callFake((request: any) => {
      switch (request) {
        case '/items?item_barcode=': 
          return (ITEM);
      }
    });

    fixture.detectChanges();

    

  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should be ok', waitForAsync(() => {
    fixture.whenStable().then(() => {
      let input = fixture.debugElement.query(By.css('input'));
      let el = input.nativeElement;

      expect(el.value).toBe('');

      el.value = 'someValue';
      el.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(fixture.componentInstance.barcode).toBe('someValue');
    });
  }));

  const ITEM ="tets";
});