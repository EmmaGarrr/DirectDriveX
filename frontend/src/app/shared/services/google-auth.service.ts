import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  user?: {
    email: string;
    name: string;
    picture?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;

  constructor(private http: HttpClient) {}

  initiateGoogleLogin(): void {
    // Create the Google OAuth URL for page redirect
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${environment.googleOAuth.clientId}&` +
      `redirect_uri=${environment.googleOAuth.redirectUri}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // Redirect to Google OAuth page (no popup)
    window.location.href = googleAuthUrl;
  }

  handleGoogleCallback(code: string): Observable<GoogleAuthResponse> {
    return this.http.post<GoogleAuthResponse>(`${this.API_URL}/google/callback`, { code });
  }
}
