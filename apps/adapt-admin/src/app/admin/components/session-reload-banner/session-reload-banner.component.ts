import { Component } from '@angular/core';
import { UserService } from '../../../auth/services/user/user.service';
import { UserTimeOutCache } from '@adapt/types';
import { Router } from '@angular/router';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'adapt-session-reload-banner',
  templateUrl: './session-reload-banner.component.html',
  styleUrl: './session-reload-banner.component.scss',
})
export class SessionReloadBannerComponent {
  public show = false;

  public dirty = false;

  public cache?: UserTimeOutCache

  public review = '';

  constructor(private user: UserService, private router: Router, private data: AdaptDataService){
    this.user.userActivity$.subscribe(async (activity) => {
      
      if(!activity.cache || Object.keys(activity.cache).length <= 0) return;

      const cache = activity.cache;

      if(Date.now() > cache.expiry) return;

      this.cache = cache;

      this.review = this.inactivityReview();

      this.show = true;

    });
  }



  public resumeSession(){

    if(!this.cache) return;

    switch(this.cache.type){
      case 'Report':{
        
        if(this.cache.action === 'CREATION'){
          this.router.navigate(['admin', 'reports'], {state: {report: this.cache.body, dirty: this.cache.dirty}})
        }else if (this.cache.action === 'EDIT'){
          this.router.navigate(['admin', 'reports', this.cache.body.reportID], {state: {editMode: true, dirty: this.cache.dirty}, queryParams: {version: this.cache.body.version || 'draft'}})
        }


        break;
      }
      case 'DataSource':{
        this.router.navigate(['admin', 'settings', 'data-sources'], {state: {mode: this.cache.action, dataSource: this.cache.body, dirty: this.cache.dirty}})
        break;
      }
      case 'DataView':{
        this.router.navigate(['admin', 'data-management'], {state: {mode: this.cache.action, dataView: this.cache.body, dirty: this.cache.dirty}})
        break;
      }
    }

    // clear cache

    this.user.clearUserInactivity()


  }

  public inactivityReview(){
    if(!this.cache) return '';

    let base = '';

    switch(this.cache.action){
      case 'EDIT':{
        base += "editing a "
        break;
      }
      case 'CREATION':{
        base += "creating a new "
        break;
      }
      case 'GENERIC_SAVE':{
        base += "on a "
        break;
      }
    }

    switch(this.cache.type){
      case 'DataSource':{
        base += `data source named: ${(this.cache.body as any).name}`;
        break;
      }
      case 'Report':{
        base += `report named: ${(this.cache.body as any).title}`;
        break;
      }
      case 'DataView':{
        base += `data view named: ${(this.cache.body as any).name}`;
        break;
      }
      case 'Generic':{
        base += "page"
        break;
      }
    }

    return base;
  }

}
