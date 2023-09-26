import { waitForAsync, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { of, of as observableOf } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { SubmissionEditComponent } from './submission-edit.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { SubmissionService } from '../submission.service';
import { SubmissionServiceStub } from '../../shared/testing/submission-service.stub';

import { RouterStub } from '../../shared/testing/router.stub';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { mockSubmissionObject } from '../../shared/mocks/submission.mock';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { ItemDataService } from '../../core/data/item-data.service';
import { SubmissionJsonPatchOperationsServiceStub } from '../../shared/testing/submission-json-patch-operations-service.stub';
import { SubmissionJsonPatchOperationsService } from '../../core/submission/submission-json-patch-operations.service';
import { AuthServiceStub } from '../../shared/testing/auth-service.stub';
import { AuthService } from '../../core/auth/auth.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { SectionsService } from '../sections/sections.service';
import { SectionsServiceStub } from '../../shared/testing/sections-service.stub';
import { ThemeService } from '../../shared/theme-support/theme.service';
import { getMockThemeService } from '../../shared/mocks/theme-service.mock';
import { provideMockStore } from '@ngrx/store/testing';

describe('SubmissionEditComponent Component', () => {

  let comp: SubmissionEditComponent;
  let fixture: ComponentFixture<SubmissionEditComponent>;
  let submissionServiceStub: SubmissionServiceStub;
  let itemDataService: ItemDataService;
  let submissionJsonPatchOperationsServiceStub: SubmissionJsonPatchOperationsServiceStub;
  let router: RouterStub;
  let halService: jasmine.SpyObj<HALEndpointService>;

  let themeService = getMockThemeService();

  const submissionId = '826';
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  const submissionObject: any = mockSubmissionObject;

  beforeEach(waitForAsync(() => {
    itemDataService = jasmine.createSpyObj('itemDataService', {
      findByHref: createSuccessfulRemoteDataObject$(submissionObject.item),
    });

    halService = jasmine.createSpyObj('halService', {
      getEndpoint: of('fake-url')
    });

    TestBed.configureTestingModule({
    imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
            { path: ':id/edit', component: SubmissionEditComponent, pathMatch: 'full' },
        ]),
        SubmissionEditComponent
    ],
    providers: [
        { provide: NotificationsService, useClass: NotificationsServiceStub },
        { provide: SubmissionService, useClass: SubmissionServiceStub },
        { provide: SubmissionJsonPatchOperationsService, useClass: SubmissionJsonPatchOperationsServiceStub },
        { provide: ItemDataService, useValue: itemDataService },
        // { provide: TranslateService, useValue: getMockTranslateService() },
        { provide: Router, useValue: new RouterStub() },
        { provide: ActivatedRoute, useValue: route },
        { provide: AuthService, useValue: new AuthServiceStub() },
        { provide: HALEndpointService, useValue: halService },
        { provide: SectionsService, useValue: new SectionsServiceStub() },
        { provide: ThemeService, useValue: themeService },
        provideMockStore()
    ],
    schemas: [NO_ERRORS_SCHEMA]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionEditComponent);
    comp = fixture.componentInstance;
    submissionServiceStub = TestBed.inject(SubmissionService as any);
    submissionJsonPatchOperationsServiceStub = TestBed.inject(SubmissionJsonPatchOperationsService as any);
    router = TestBed.inject(Router as any);
  });

  afterEach(() => {
    comp = null;
    fixture = null;
    router = null;
  });

  it('should init properly when a valid SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(
      createSuccessfulRemoteDataObject$(submissionObject)
    );
    submissionServiceStub.getSubmissionObject.and.returnValue(observableOf(submissionObject));
    submissionServiceStub.getSubmissionStatus.and.returnValue(observableOf(true));


    fixture.detectChanges();

    expect(comp.submissionId).toBe(submissionId);
    expect(comp.collectionId).toBe(submissionObject.collection.id);
    expect(comp.selfUrl).toBe(submissionObject._links.self.href);
    expect(comp.sections).toBe(submissionObject.sections);
    expect(comp.submissionDefinition).toBe(submissionObject.submissionDefinition);

  });

  it('should redirect to mydspace when an empty SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(createSuccessfulRemoteDataObject$({})
    );

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalled();

  });

  it('should not has effects when an invalid SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(observableOf(null));

    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(comp.collectionId).toBeUndefined();
    expect(comp.selfUrl).toBeUndefined();
    expect(comp.sections).toBeUndefined();
    expect(comp.submissionDefinition).toBeUndefined();
  });

  describe('ngOnDestroy', () => {
    it('should call delete pending json patch operations', fakeAsync(() => {

      submissionJsonPatchOperationsServiceStub.deletePendingJsonPatchOperations.and.callFake(() => { /* */ });
      comp.ngOnDestroy();

      expect(submissionJsonPatchOperationsServiceStub.deletePendingJsonPatchOperations).toHaveBeenCalled();
    }));

  });


});
