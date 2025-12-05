import { Pipe, PipeTransform } from '@angular/core';
import { AdaptDataService } from '../../services/adapt-data.service';
import { AdaptDataViewService } from '@adapt-apps/adapt-admin/src/app/services/adapt-data-view.service';

@Pipe({
  name: 's3FileSize',
  standalone: false,
})
export class S3FileSizePipe implements PipeTransform {
  constructor(private adaptDataViewService: AdaptDataViewService,) {}

  transform(filename: string, dataViewID: string, fileID: string): Promise<string> {
    return this.adaptDataViewService.getDataViewUploadURLPromise({ dataViewID, fileID, filename })
      .then((url) => fetch(url, { method: 'HEAD' }))
      .then((req) => req.headers.get('content-length') as string);
  }
}
