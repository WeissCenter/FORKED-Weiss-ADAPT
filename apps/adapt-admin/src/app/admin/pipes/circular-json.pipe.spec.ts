import { CircularJsonPipe } from './circular-json.pipe';

describe('CircularJsonPipe', () => {
  it('create an instance', () => {
    const pipe = new CircularJsonPipe();
    expect(pipe).toBeTruthy();
  });
});
