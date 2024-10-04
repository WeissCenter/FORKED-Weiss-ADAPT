import { Pipe, PipeTransform } from '@angular/core';
import { AdaptDataService } from '../../services/adapt-data.service';

@Pipe({
  name: 's3FileSize',
})
export class S3FileSizePipe implements PipeTransform {
  constructor(private data: AdaptDataService) {}

  transform(filename: string, dataViewID: string, fileID: string): Promise<string> {
    return this.data
      .getDataViewUploadURLPromise({ dataViewID, fileID, filename })
      .then((url) => fetch(url, { method: 'HEAD' }))
      .then((req) => req.headers.get('content-length') as string);
  }
}
