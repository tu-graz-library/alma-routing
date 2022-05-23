import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, CloudAppTranslateModule, AlertModule, MenuModule } from '@exlibris/exl-cloudapp-angular-lib';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//import { SelectEntitiesModule } from 'eca-components';
import { ToastrModule } from 'ngx-toastr';



import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { SettingsComponent } from './settings/settings.component';
import { PrintLayoutComponent } from './print-layout/print-layout.component';
import { SlipletterComponent } from './slipletter/slipletter.component';
import { TranslateComponent } from './translate/translate.component';

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SettingsComponent,
    PrintLayoutComponent,
    SlipletterComponent,
    TranslateComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    //SelectEntitiesModule,
    MenuModule,
    CloudAppTranslateModule.forRoot(),
    AlertModule,

    getToastrModule(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
