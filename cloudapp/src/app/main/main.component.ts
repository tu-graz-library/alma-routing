import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CloudAppRestService, CloudAppEventsService, Request, HttpMethod,
  Entity, PageInfo, RestErrorResponse, AlertService,
  CloudAppSettingsService
} from '@exlibris/exl-cloudapp-angular-lib';
//import { Configuration } from "../models/configuration.model";
import { Settings } from '../models/settings';
import { User } from '../models/user.model';
import { AppService } from '../app.service';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  pageEntities: Entity[];
  private _apiResult: any;
  barcode : string = "";
  mms : string = "";
  processType : string = "";
  holdingID : string = "";
  pid : string = "";
  poLine : string = "";
  bibTitle : string = "";
  itemDesc : string = "";
  itemCallNr : string = "";
  itemLocation : string = "";
  itemLibrary : string = "";
  issn : string = "";
  intUsers: any;

  hasApiResult: boolean = false;
  loading = false;
  loadingSettings: boolean = false;
  userBlock: boolean = false;
  settings: Settings;
  user: User = { id:"", last_name:"", first_name:"", default_address:{city:"", postal_code:"", address_line1:"",address_line2:"",address_line3:"",address_line4:"",address_line5:""}};
  
  /* translate */
  policies: { code: string, desc: string }[];
  today = new Date().toLocaleDateString();
  blockTypes: any;

  constructor(private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private settingsService: CloudAppSettingsService,
    private toastr: ToastrService,
    /* translate */
    private appService: AppService,
    private translate: TranslateService,) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
    this.loadingSettings = true;
    this.settingsService.get().subscribe(settings => {
      this.settings = settings as Settings;
      
      if ((this.settings.library != "") && (this.settings.circDesk != "")){
      this.loadingSettings = false;
      
      }
      /*
      this.alertSubscription = this.alertService.onAlert(this.id)
      .subscribe(alert => {
        if (!alert.message) {
          this.alerts = [];
          return;
        }

        this.alerts.push(alert);

        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), 3000);
        }
      }
    );

    // clear alerts on location change
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.alertService.clear(this.id);
      }
    });*/
    }
    
    );

  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  get apiResult() {
    return this._apiResult;
  }

  set apiResult(result: any) {
    this._apiResult = result;
    this.hasApiResult = result && Object.keys(result).length > 0;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    /*this.pageEntities = pageInfo.entities;
    if ((pageInfo.entities || []).length == 1) {
      const entity = pageInfo.entities[0];
      this.restService.call(entity.link).subscribe(result => this.apiResult = result);
    } else {
      this.apiResult = {};
    }*/
  }
/*
  update(value: any) {
    this.loading = true;
    let requestBody = this.tryParseJson(value);
    if (!requestBody) {
      this.loading = false;
      return this.toastr.error('Failed to parse json');
    }
    this.sendUpdateRequest(requestBody);
  }
*/
  refreshPage = () => {
    this.loading = true;
    this.eventsService.refreshPage().subscribe({
      next: () => this.alert.success('Success!'),
      error: e => {
        console.error(e);
        this.alert.error('Failed to refresh page');
      },
      complete: () => this.loading = false
    });
  }
/*
  private sendUpdateRequest(requestBody: any) {
    let request: Request = {
      url: this.pageEntities[0].link,
      method: HttpMethod.PUT,
      requestBody
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        this.refreshPage();
      },
      error: (e: RestErrorResponse) => {
        this.toastr.error('Failed to update data');
        console.error(e);
        this.loading = false;
      }
    });
  }*/
/*
  private getQueryParams() {
    let queryParams = { op: "scan", ...this.config.mustConfig, ...this.config?.from };
    //queryParams.circ_desk !== "" ? (queryParams = { ...queryParams, ...this.config.departmentArgs }) : null;
    //queryParams.circ_desk == "" ? (queryParams = { ...queryParams, ...this.config.departmentArgs }) : null;
    queryParams.library == "INST_LEVEL" ? queryParams.library = "" : null;
    return queryParams;
  }
*/
  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  private getItemRequest(barcode: string) {
    
    let request: Request = {
      url: "/items?item_barcode="+barcode,
      method: HttpMethod.GET
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        //this.refreshPage();
        this.pid = this.apiResult.item_data.pid;
        this.mms = this.apiResult.bib_data.mms_id;
        this.poLine = this.apiResult.item_data.po_line;
        this.processType = this.apiResult.item_data.process_type.value;
        this.holdingID = this.apiResult.holding_data.holding_id;
        this.bibTitle = this.apiResult.bib_data.title;
        this.itemDesc = this.apiResult.item_data.description;
        this.itemCallNr = this.apiResult.holding_data.permanent_call_number;
        this.itemLocation = this.apiResult.item_data.location.desc;
        this.itemLibrary = this.apiResult.item_data.library.desc;
        this.issn = this.apiResult.bib_data.issn;
        //alert("PO Line: " + this.poLine+"\nProcess-Type: "+this.processType+"\nMMS: "+this.mms+"\nHolding: "+this.holdingID+"\nPID: "+this.pid);
        this.getPoLine(this.poLine);
      },
      error: (e: RestErrorResponse) => {
        this.alert.error(this.translate.instant('Translate.BarcodeInvalid'));
        console.error(e);
        this.loading = false;
      }
    });
  
  }

  private getInterestUser(barcode: string){
    this.getItem(barcode);
  }

  private getPoLine(poLine: string) {
    let urle = "/acq/po-lines/" + poLine;
    let request: Request = {
      url: urle,
      method: HttpMethod.GET
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        
        this.intUsers = this.apiResult.interested_user;
        let allusers = "";
    
        if ((this.processType == "")&&(this.intUsers!=undefined)) {
          this.user.id = this.apiResult.interested_user[0].primary_id;
          for (let i = 0; i < this.intUsers.length; i++) {
            allusers = allusers+"\n"+this.intUsers[i].primary_id +": "+this.intUsers[i].last_name;
          }
         
          if (this.user.id != "") this.getFullUser(this.user);
          } else if ((this.processType == "LOAN")&&(this.intUsers!=undefined)){
            //alert ("Item is loaned!");
            this.getLoan(this.apiResult.interested_user);
  
        } else if (this.intUsers==undefined){this.alert.error ("No interested User!");}
        else { this.alert.error ("Item can't be loaned!"); }
      },
      error: (e: RestErrorResponse) => {
        this.alert.error('Failed to get PO Line');
        console.error(e);
        this.loading = false;
      }
    });
    
  }

  private getLoan(inUser : any) {
    
    let urle = "/bibs/"+this.mms+"/holdings/"+this.holdingID+"/items/"+this.pid+"/loans";
    let activeUser = "";
    let request: Request = {
      url: urle,
      method: HttpMethod.GET
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        activeUser = result.item_loan[0].user_id;
        //alert('Entlehnt an: '+activeUser);
        this.makeReturn(activeUser, inUser);
        
        //this.refreshPage();
        return activeUser;
      },
      error: (e: RestErrorResponse) => {
        this.alert.error('Failed to get Loan');
        console.error(e);
        this.loading = false;
      }
    });
    return "";
  }

  private makeReturn(acUser : string, inUser : any) {
    
    let urle = "/bibs/"+this.mms+"/holdings/"+this.holdingID+"/items/"+this.pid+"?op=scan&library="+this.settings.library+"&circ_desk="+this.settings.circDesk+"&done=true";
    let request: Request = {
      url: urle,
      method: HttpMethod.POST
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        //alert('Return performed!');
        this.makeNextLoan(inUser, acUser);
        //this.refreshPage();
      },
      error: (e: RestErrorResponse) => {
        this.alert.error(e.message);
        console.error(e);
        this.loading = false;
      }
    });
    
  }

  private extractData(res: Response) {
    let body = res.json();
    // return just the response, or an empty array if there's no data
    return body || []; 
  }

  private makeNextLoan(value: any, activeUser){
    let inusers = value;
    let actUser = activeUser;
    //let nextUser = "";

    for (let i = 0; i < inusers.length; i++) {
      if ((inusers[i].primary_id == actUser)&&(i != inusers.length-1)) {
          //nextUser = inusers[i+1].primary_id;
          this.user.id = inusers[i+1].primary_id;
      } 
    }
    if ((this.user.id != "")&&(this.user.id != activeUser)) this.getFullUser(this.user);
    else{
      this.alert.warn(this.translate.instant('Translate.EndRouting') + this.itemLibrary+' - ' + this.itemLocation+"</b>");
      
    }
  }

  private getFullUser(user : User){
    
    const urle = `/users/${user.id}`;
        
    let request: Request = {
      url: urle,
      method: HttpMethod.GET
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        user.first_name = (this.apiResult.first_name != undefined) ?  this.apiResult.first_name : "";
        user.last_name = (this.apiResult.last_name != undefined) ?  this.apiResult.last_name : "";
        user.default_address.city = this.apiResult.contact_info.address[0].city;
        for (let i = 0; i < this.apiResult.contact_info.address.length; i++) {
          if (this.apiResult.contact_info.address[i].preferred == true) {
              //nextUser = inusers[i+1].primary_id;
              user.default_address.address_line1 = this.apiResult.contact_info.address[i].line1;
              user.default_address.address_line2 = this.apiResult.contact_info.address[i].line2;
              user.default_address.address_line3 = this.apiResult.contact_info.address[i].line3;
              user.default_address.address_line4 = this.apiResult.contact_info.address[i].line4;
              user.default_address.address_line5 = this.apiResult.contact_info.address[i].line5;
              user.default_address.city = this.apiResult.contact_info.address[i].city;
              user.default_address.postal_code = this.apiResult.contact_info.address[i].postal_code;
          }
        }

        this.performLoan(user);
        
      },
      error: (e: RestErrorResponse) => {
        this.alert.error(this.translate.instant('Translate.GetUserFailed'));
        console.error(e);
        this.loading = false;
      }
    });
  

}

  private performLoan(user : User){
    
      const urle = `/users/${user.id}/loans/?item_barcode=${this.barcode}`;
      const requestBody = {
        "circ_desk": {
          "value": this.settings.circDesk
        },
        "library": {
          "value": this.settings.library
        }
      };

      
      let request: Request = {
        url: urle,
        method: HttpMethod.POST,
        requestBody
      };
      this.restService.call(request).subscribe({
        next: result => {
          this.apiResult = result;
          //alert(`Loan performed (${user.last_name} ${user.first_name} ${user.default_address.city})!`);
          this.alert.success(`Loan performed (${user.last_name} ${user.first_name})!`);
          this.barcode = '';
          let printText : string = '';
          let due_date= new Date(result.due_date);

          
          this.printSlipLetter(user , due_date);
          this.refreshPage;
        },
        error: (e: RestErrorResponse) => {
          this.alert.error(`Loan on user ${user.last_name} ${user.first_name} (${user.id}) failed!  ${e.message}`);
          //this.loading = false;
          this.userBlock = true;
          this.loading = false;
          console.error(e);
        }
      });
    

  }

  skipUser(skip : boolean){
    this.userBlock = false;
    if(skip) this.makeNextLoan(this.intUsers,this.user.id);
    else {
        this.alert.error("User skipped. Routing reseted.");
    }
    this.loading = false;
  }
  lgbtnclick(){
    alert(this.barcode)

    console.log(Error)
 }

 getItem(value: any) {
  this.loading = true;
  let barcode = value;
  if (!barcode) {
    this.loading = false;
    return this.alert.error(this.translate.instant('Translate.BarcodeInvalid'));
  }
  

  this.getItemRequest(barcode);
}

printSlipLetter(user : User, due_date : Date) {
    
  // Format content
  //var formatted_content = content.replace(/(?:\r\n|\r|\n)/g, '<br />');
  var formatted_content = `<b>${user.first_name} ${user.last_name}</b><br/><br/>`;
  if (user.default_address.address_line1 != null) formatted_content += user.default_address.address_line1 + '<br/>';
  if (user.default_address.address_line2 != null) formatted_content += user.default_address.address_line2 + '<br/>';
  if (user.default_address.address_line3 != null) formatted_content += user.default_address.address_line3 + '<br/>';
  if (user.default_address.address_line4 != null) formatted_content += user.default_address.address_line4 + '<br/>';
  if (user.default_address.address_line5 != null) formatted_content += user.default_address.address_line5 + '<br/>';
  if (user.default_address.postal_code != null) formatted_content += user.default_address.postal_code + ' ';
  if (user.default_address.city != null) formatted_content += user.default_address.city + '<br/><br/>';
  formatted_content += this.translate.instant('Translate.DueDate') + due_date.toLocaleDateString("en-GB");
  formatted_content += '<br/>'+this.bibTitle;
  formatted_content += '<br/>'+this.issn;
  formatted_content += '<br/>'+this.itemLibrary;
  formatted_content += '<br/>'+this.itemLocation;
  formatted_content += '<br/>'+this.itemDesc;
  formatted_content += '<br/>Barcode: '+this.barcode;
  
  // Size page with print settings
  var styles = '';
  /*var styles = '<style>';
  styles += '@page {size: ' + this.settings.labelWidth + ' ' + this.settings.labelHeight + ';}';
  styles += 'body {';
  styles += 'font-family: "' + this.settings.fontFamily + '";';
  styles += 'font-size: ' + this.settings.fontSize + ';';
  styles += 'font-weight: ' + this.settings.fontWeight + ';';
  styles += 'line-height: ' + this.settings.lineHeight + ';';
  styles += 'margin-left:' + this.settings.marginLeft + ';';
  styles += 'margin-right:' + this.settings.marginRight + ';';
  styles += 'margin-top:' + this.settings.marginTop + ';';
  styles += 'margin-bottom:' + this.settings.marginBottom + ';';
  styles += '}';
  styles += '</style>';*/
  
  // Open print dialog
  var win = (window as any).open('','','left=0,top=0,width=552,height=477,toolbar=0,scrollbars=0,status =0');
  win.document.write('<html><head><title>Routing Letter</title>' + styles + '</head><body>' + formatted_content + '</body></html>');
  win.print();
  win.document.close();
  win.close();
}

}
