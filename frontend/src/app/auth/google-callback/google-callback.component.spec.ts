import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GoogleCallbackComponent } from './google-callback.component';
import { GoogleAuthService } from '../../shared/services/google-auth.service';

describe('GoogleCallbackComponent', () => {
  let component: GoogleCallbackComponent;
  let fixture: ComponentFixture<GoogleCallbackComponent>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockGoogleAuthService = jasmine.createSpyObj('GoogleAuthService', ['handleGoogleCallback']);
    mockActivatedRoute = {
      queryParams: of({ code: 'test-code' })
    };

    await TestBed.configureTestingModule({
      declarations: [ GoogleCallbackComponent ],
      providers: [
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
