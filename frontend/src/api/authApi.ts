export interface SignUpPayload {
  name: string;
  displayName?: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: any;
  };
  body?: {
    user?: any;
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json.error || json.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    (err as any).data = json;
    throw err;
  }
  return json as T;
}

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/sign-up
   */
  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    const res = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name || payload.displayName,
        displayName: payload.displayName || payload.name,
        email: payload.email,
        password: payload.password,
      }),
    });
    return handleResponse<AuthResponse>(res);
  },

  /**
   * Check if user is verified by email
   * GET /api/auth/status?email=...
   */
  async checkVerificationStatus(email: string): Promise<{ isVerified: boolean }> {
    const res = await fetch(`/api/auth/status?email=${encodeURIComponent(email)}`);
    return handleResponse<{ isVerified: boolean }>(res);
  },

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(email: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<AuthResponse>(res);
  },

  /**
   * Log in an existing verified user
   * POST /api/auth/sign-in
   */
  async signIn(payload: SignInPayload): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<AuthResponse>(res);
    if (!result.data?.token || !result.data?.user) {
      throw new Error('Authentication response missing user or token');
    }
    return { token: result.data.token, user: result.data.user };
  },

  /**
   * Sign out the user session
   * POST /api/auth/sign-out
   */
  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch {
      // Best effort
    }
  },

  /**
   * Verify email using token from the link
   * GET /api/auth/verify-email?token=...
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    return handleResponse<AuthResponse>(res);
  },

  /**
   * Request password reset link
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<AuthResponse>(res);
  },

  /**
   * Check if password reset link was opened & verified
   * GET /api/auth/reset-status?email=...
   */
  async checkResetStatus(email: string): Promise<{ isVerified: boolean; token?: string; id?: string }> {
    const res = await fetch(`/api/auth/reset-status?email=${encodeURIComponent(email)}`);
    return handleResponse<{ isVerified: boolean; token?: string; id?: string }>(res);
  },

  /**
   * Apply new password using resetToken and user ID
   * POST /api/auth/reset-password
   */
  async resetPassword(payload: { id: string; token: string; newPassword: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(res);
  },

  /**
   * Get authenticated user profile & settings
   * GET /api/users/me
   */
  async getMe(token: string): Promise<any> {
    const res = await fetch('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<any>(res);
  },
};
