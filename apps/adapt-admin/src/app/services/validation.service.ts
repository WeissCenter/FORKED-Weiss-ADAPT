import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Response as APIResponse } from '@adapt/types';
import { firstValueFrom, map, tap } from 'rxjs';
import { ValidationTemplate } from '@adapt/validation';
import { AdaptDataService } from './adapt-data.service';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  validationTemplateCache: { [id: string]: ValidationTemplate } = {};

  constructor(
    private http: HttpClient,
    private dataService: AdaptDataService,
    private logger: NGXLogger
  ) {
    this.validationTemplateCache = {};
    // check session storage for cached templates
    const cachedTemplates = sessionStorage.getItem('validationTemplates');
    if (cachedTemplates) {
      this.logger.debug('setting validation template cache from session storage');
      this.validationTemplateCache = JSON.parse(cachedTemplates);
    }
  }

  // Get validation template by fileSpec from the API
  public getValidationTemplate(fileSpec: string) {
    if (this.validationTemplateCache[fileSpec]) {
      this.logger.debug('Using cached validation template for fileSpec: ', fileSpec);
      return new Promise<ValidationTemplate>((resolve) => {
        resolve(this.validationTemplateCache[fileSpec]);
      });
    }
    return firstValueFrom(
      this.dataService.getTemplate<ValidationTemplate>("ValidationTemplate", fileSpec).pipe(
        tap((template) => {
          this.logger.debug('caching validation template for fileSpec: ', fileSpec);
          this.validationTemplateCache[fileSpec] = template;
          sessionStorage.setItem('validationTemplates', JSON.stringify(this.validationTemplateCache));
        })
      )
    );
  }

  public validateFile(dataSourceID: string, originFile?: string) {
    return this.http.get<APIResponse<any>>(originFile ? `${environment.API_URL}validate-file/${dataSourceID}?originFile=${originFile}` : `${environment.API_URL}validate-file/${dataSourceID}`, {
      observe: 'response',
    });
  }
}
