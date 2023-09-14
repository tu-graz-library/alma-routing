import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { FormGroup } from '@angular/forms';
import { AlertService, CloudAppSettingsService, FormGroupUtil, CloudAppConfigService,
  CloudAppRestService,  RestErrorResponse, } from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { Configuration } from "../models/configuration.model";
import { Library } from "./../models/library.model";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  //settings: Settings = new Settings();
  loading: boolean = false;

  form: FormGroup;
  saving = false;

  constructor(
    private appService: AppService,
    private settingsService: CloudAppSettingsService,
    private alert: AlertService,
    
  ) { }

  ngOnInit(): void {
    this.loading = true;
    
    this.appService.setTitle('Settings');
    this.settingsService.get().subscribe( settings => {
      this.form = FormGroupUtil.toFormGroup(Object.assign(new Settings(), settings))
      
    });

  }

  save() {
     this.settingsService.set(this.form.value).subscribe(
      response => {
        this.alert.success('Settings successfully saved.');
        this.form.markAsPristine();
      },
      err => this.alert.error(err.message),
      ()  => this.saving = false
    );
    
  }

  onRestore() {
    this.settingsService.set( new Settings()).subscribe(
      response => {
        this.alert.success('Default settings restored.');
        this.form.markAsPristine();
        this.form.reset();
      },
      err => this.alert.error(err.message),
      ()  => this.saving = false
    );
  }
}
