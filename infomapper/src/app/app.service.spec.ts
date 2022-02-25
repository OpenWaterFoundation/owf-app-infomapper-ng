// import { HttpClientTestingModule,
//           HttpTestingController } from '@angular/common/http/testing';
// import { getTestBed,
//           TestBed }               from '@angular/core/testing';

// import { AppService }             from './app.service';

// describe('AppService', () => {
//   let injector: TestBed;
//   let appService: AppService;
//   let httpMock: HttpTestingController;
  
//   /**
//    * Run before each function is called.
//    */
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//     imports: [ HttpClientTestingModule ],
//     providers: [ AppService ]
//     });
//     injector = getTestBed();
//     appService = injector.inject(AppService);
//     httpMock = injector.inject(HttpTestingController)
//   });

//   /**
//    * Run after each function is called. Confirm there are no outstanding requests
//    * after a single test is performed.
//    */
//   afterEach(() => {
//     httpMock.verify();
//   });

  
//   it('should be created', () => {
//     expect(appService).toBeTruthy();
//   });
// });
