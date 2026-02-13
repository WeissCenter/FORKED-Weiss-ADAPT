export interface Response<T> {
  success: boolean;
  err?: string;
  data: T;
}

export interface ReleaseNoAndDateResponse {
  releaseDate: string;
  releaseNo: string;
}
