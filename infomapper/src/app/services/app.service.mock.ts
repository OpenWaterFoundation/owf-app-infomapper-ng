import { of } from 'rxjs';

export class AppServiceStub {

  getPlainText() {
    return of("# Title #")
  }

  getJSONData() {
    return of({
      
    })
  }
}