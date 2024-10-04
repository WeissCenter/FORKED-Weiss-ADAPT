import { S3FileSizePipe } from './s3-file-size.pipe';

describe('S3FileSizePipe', () => {
  it('create an instance', () => {
    const pipe = new S3FileSizePipe();
    expect(pipe).toBeTruthy();
  });
});
