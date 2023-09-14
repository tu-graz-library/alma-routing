import { ComponentFixture } from "@angular/core/testing";
import { CloudAppRestService, EntityType, PageInfo } from "@exlibris/exl-cloudapp-angular-lib";
import { of, Subject } from "rxjs";
import { map } from "rxjs/operators";

const PAGE_INFO: PageInfo = {
  entities: [{
    "id": "23140519980000561",
    "type": EntityType.ITEM,
    "description": "AUT1469",
    "link": "/bibs/99242439000561/holdings/22140539880000561/items/23140519980000561"
  }, {
    "id": "23139149860000561",
    "type": EntityType.ITEM,
    "description": "AUTO1365",
    "link": "/bibs/99242439000561/holdings/22138939940000561/items/23139149860000561"
  }, {
    "id": "23139149850000561",
    "type": EntityType.ITEM,
    "description": "4356",
    "link": "/bibs/99242439000561/holdings/22138939940000561/items/23139149850000561"
  }]
};

const EMPTY_PAGE_INFO: PageInfo = {
  entities: [],
}

const REST_RESPONSE = {
  "link": "/bibs/99242439000561/holdings/22138939940000561/items/23139149860000561",
  "holding_data": {
    "link": "string",
    "holding_id": "224831320000121",
    "copy_id": "142312420001021",
  },
  "item_data": {
    "barcode": "AUTO1365",
    "physical_material_type": {
      "value": "ROOM"
    },
    "policy": {
      "value": "09"
    }
  }
}

const onPageLoadSubject$ = new Subject<any>();
const loadingSettings$ = new Subject<any>();

const mockEventsService = {
  onPageLoad: handler => onPageLoadSubject$.subscribe(data => handler(data)),
  entities$: onPageLoadSubject$.asObservable().pipe(map(info => info.entities)),
  refreshPage: () => of(true),
}


const restSpy = (fixture: ComponentFixture<any>) => {
  let mockRestService = fixture.debugElement.injector.get(CloudAppRestService);
  return spyOn<any>(mockRestService, 'call').and.callFake((request: any) => {
    return of(REST_RESPONSE);
  });
}

export { PAGE_INFO, EMPTY_PAGE_INFO, REST_RESPONSE, onPageLoadSubject$, mockEventsService, restSpy }