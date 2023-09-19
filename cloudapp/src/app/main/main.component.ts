import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CloudAppRestService, CloudAppEventsService, Request, HttpMethod,
  PageInfo, RestErrorResponse, AlertService,
  CloudAppSettingsService
} from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings';
import { User } from '../models/user.model';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
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
  showSkip: boolean = false;
  settings: Settings;
  user: User = { id:"", last_name:"", first_name:"", default_address:{city:"", postal_code:"", address_line1:"",address_line2:"",address_line3:"",address_line4:"",address_line5:""}};
  
  /* translate */
  policies: { code: string, desc: string }[];

  today = new Date().toLocaleDateString();
  blockTypes: any;

  constructor(
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private settingsService: CloudAppSettingsService,
    private translate: TranslateService,
    ) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
    this.settingsService.get().subscribe(settings => {
      this.settings = settings as Settings;
      if ((this.settings.library != "") && (this.settings.circDesk != "")){
        this.loadingSettings = false;
      }else{
        this.loadingSettings = true;
      }
    });
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
  }

  
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


  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  private getItemRequest(barcode: string) {
    this.loading = true;
    let request: Request = {
      url: "/items?item_barcode="+encodeURIComponent(barcode),
      method: HttpMethod.GET
    };
    
    this.restService.call(request).subscribe({
      next: result => {
        this.loading = true;
        this.apiResult = result;
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
        this.getPoLine(this.poLine);
      },
      error: (e: RestErrorResponse) => {
        this.alert.error(this.translate.instant('Translate.BarcodeInvalid'));
        console.error(e);
        this.loading = false;
      }
    });
  
  }

  getInterestUser(barcode: string){
    this.loading=true;
    this.user.id = "";
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
        // allusers = "";
    
        if ((this.processType == "")&&(this.intUsers!=undefined)) {
          
          if (this.apiResult.interested_user[0].notify_cancel){
            this.user.id = this.apiResult.interested_user[0].primary_id;
          if (this.user.id != "") this.getFullUser(this.user);
               
}else{
          
          this.user.id = this.apiResult.interested_user[0].primary_id;
          this.makeNextLoan(this.intUsers, this.apiResult.interested_user[0].primary_id);
          
        }
          } else if ((this.processType == "LOAN")&&(this.intUsers!=undefined)){
            this.getLoan(this.apiResult.interested_user);
  
        } else if (this.intUsers==undefined){
          this.alert.error (this.translate.instant('Translate.NoInterestedUser'));
          this.loading = false;
        } else { 
          this.alert.error (this.translate.instant('InProcessItem'));
          this.loading = false;
       }
      },
      error: (e: RestErrorResponse) => {
        this.alert.error(e.message + this.translate.instant('FailGetPOLine'));
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
        this.makeReturn(activeUser, inUser);
        
        return activeUser;
      },
      error: (e: RestErrorResponse) => {
        this.alert.error(e.message);
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
        this.makeNextLoan(inUser, acUser);
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
    this.user.id = "";
    //let nextUser = "";

    for (let i = 0; i < inusers.length; i++) {
      if ((inusers[i].primary_id == actUser)&&(i != inusers.length-1)) {
          //nextUser = inusers[i+1].primary_id;
          if (inusers[i+1].notify_cancel) this.user.id = inusers[i+1].primary_id;
          else actUser = inusers[i+1].primary_id;
      } 
    }
    if ((this.user.id != "")&&(this.user.id != activeUser)) this.getFullUser(this.user);
    else{
      this.barcode = "";
      this.alert.warn(this.translate.instant('Translate.EndRouting') + this.itemLibrary+' - ' + this.itemLocation+"</b>");
      this.loading = false;
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
    
      const urle = `/users/${user.id}/loans/?item_barcode=${encodeURIComponent(this.barcode)}`;
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
          
          let printText : string = '';
          let due_date= new Date(result.due_date);

          
          this.printSlipLetter(user , due_date);
          this.barcode = '';
          //this.refreshPage;
        },
        error: (e: RestErrorResponse) => {
          this.alert.error(`Loan on user ${user.last_name} ${user.first_name} (${user.id}) failed!  ${e.message}`);
          this.showSkip = true;
          this.loading = false;
          console.error(e);
          this.skipUsers(this.settings.autoSkipUser);
        }
      });
    

  }
  
  skipUsers(skipU : boolean){
    if (skipU) this.skipUser(true);
    else this.showSkip = true;
  }

  skipUser(skip : boolean){
    this.showSkip = false;
    if(skip) {
      this.showSkip = false;
      this.alert.warn(this.translate.instant('Translate.UserSkiped'));
      this.makeNextLoan(this.intUsers,this.user.id);
    }
    else {
      this.showSkip = false;
      this.alert.info(this.translate.instant('Translate.NoSkipUser'));
    }
    this.barcode = "";
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
  formatted_content += this.translate.instant('Translate.InformUser') + '<br/>';
  formatted_content += '<br/><b>'+this.bibTitle + ' (ISSN '+this.issn+')';
  formatted_content += '<br/>'+this.itemDesc+'</b>';
  formatted_content += '<br/>'+this.translate.instant('Translate.Library')+this.itemLibrary +' / '+this.itemLocation;
  formatted_content += '<br/>Barcode: '+this.barcode;
  formatted_content += '<br/></br><b>'+this.translate.instant('Translate.DueDate') + due_date.toLocaleDateString("en-GB")+'</b>';
  let act_date= new Date();
  formatted_content += '<br/><br/><p align="right"><i>'+ act_date.toLocaleDateString("en-GB")+'</i></p>';
  
  
  // Size page with print settings
  var styles = '';
   
  // Open print dialog
  var win = (window as any).open('','','left=0,top=0,width=552,height=477,toolbar=0,scrollbars=0,status =0');
  win.document.write('<html><head><title>Routing Letter</title>' + styles + '</head><body>' + formatted_content + '</body></html>');
  win.print();
  this.loading = false;
  //win.document.close();
  //win.close();
}

handleKeyUp(e){
  if(e.keyCode == 13)
  this.getInterestUser(this.barcode);
}
}
