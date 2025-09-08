export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  user?: {
    email: string;
    name: string;
    picture?: string;
  };
}

export class GoogleAuthService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/auth`;

  initiateGoogleLogin(): void {
    // Create the Google OAuth URL for page redirect
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '471697263631-k8un0og206itv9nrji334b7uk2hf8u37.apps.googleusercontent.com';
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:4200/auth/google/callback';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // Redirect to Google OAuth page (no popup)
    window.location.href = googleAuthUrl;
  }

  async handleGoogleCallback(code: string): Promise<GoogleAuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        let errorMessage = 'Google authentication failed. Please try again.';
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use status-based error messages if JSON parsing fails
          if (response.status === 400) {
            errorMessage = 'Invalid Google authentication code.';
          } else if (response.status === 401) {
            errorMessage = 'Google authentication failed. Please try again.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error during Google authentication. Please try again later.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store token if provided
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during Google authentication. Please check your connection and try again.');
    }
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
