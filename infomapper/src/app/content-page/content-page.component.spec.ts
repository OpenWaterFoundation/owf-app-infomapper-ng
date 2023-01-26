import { HttpClientModule }     from '@angular/common/http';
import { ComponentFixture,
          TestBed }             from '@angular/core/testing';
import { RouterTestingModule }  from '@angular/router/testing';

import { of }                   from 'rxjs';

import { ContentPageComponent } from './content-page.component';
import { NotFoundComponent }    from 'src/app/not-found/not-found.component';
import { AppService }           from '../services/app.service';
import { AppServiceStub }       from '../services/app.service.mock';
import { ActivatedRoute } from '@angular/router';

describe('ContentPageComponent', () => {
  let contentPageComponent: ContentPageComponent;
  let fixture: ComponentFixture<ContentPageComponent>;
  // For use with direct properties of the service, not for calling methods that
  // make asynchronous calls.

  // It is easier and safer to create and register a test double in place of the
  // real AppService by using a stub.
  // let appServiceStub: Partial<AppService>;

  // 
  let getPlainTextSpy: jasmine.Spy;
  // 
  let testGetPlainText: string;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [ ContentPageComponent ],
      imports: [
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'home', redirectTo:'content-page/home' },
          { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
          { path: 'content-page/:markdownFilename', component: ContentPageComponent },
          { path: '404', component: NotFoundComponent },
          { path: '**', component: NotFoundComponent }
        ])
      ],
      providers: [
        { provide: AppService, useValue: AppServiceStub },
        // { provide: ActivatedRoute, useValue:  }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    // testGetPlainText = '# Title #';
    // const fakeAppService = jasmine.createSpyObj('AppService', ['getPlainText']);
    // getPlainTextSpy = fakeAppService.getPlainText.and.returnValue(of(testGetPlainText));

    fixture = TestBed.createComponent(ContentPageComponent);
    // appService = fixture.debugElement.injector.get(AppService);
    contentPageComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when tested with synchronous observable', () => {

    it('should be created', () => {
      expect(contentPageComponent).toBeTruthy();
      // expect(contentPageComponent.markdownFilePresent).toBe(true);
    });
  
    // it('should be a legitimate path to a markdown file', () => {
      
  
      
    //   // contentPageComponent.convertMarkdownToHTML('/bad/path');
    //   // fixture.detectChanges();
    //   // expect(contentPageComponent.showdownHTML).toBeUndefined();
    //   // expect(contentPageComponent.markdownFilePresent).toBe(false);
    // });
  });

  
});
