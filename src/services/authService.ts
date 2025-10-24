// Auth service for FarmConnect - simplified and robust
// User interface definition
interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FORCE_DEV_OTP = import.meta.env.VITE_FORCE_DEV_OTP === 'true';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  confirmationResult?: PhoneConfirmationResult;
}

export interface PhoneConfirmationResult {
  confirm: (code: string) => Promise<AuthResult>;
}

// User registration function
export const registerUser = async (email: string, name: string, role: 'farmer' | 'customer' = 'customer', phone?: string): Promise<AuthResult> => {
  try {
    console.log(`[AUTH] Registering user: ${email} (role: ${role})`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role, phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AUTH] Registration failed:', data);
      return {
        success: false,
        error: data.error || 'Registration failed'
      };
    }

    console.log('[AUTH] User registered successfully:', data);

    // Persist token for auto-login if provided by backend
    try {
      if (data.token) localStorage.setItem('fc_jwt', data.token);
    } catch {}

    const user: User = {
      uid: data.user._id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone || '',
      photoURL: 'https://via.placeholder.com/40x40?text=U'
    };

    return { success: true, user };

  } catch (error: any) {
    console.error('[AUTH] Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed'
    };
  }
};

// Simplified email OTP function
export const sendEmailOtp = async (email: string, role: string = 'customer', name: string = 'User'): Promise<AuthResult> => {
  try {
    console.log(`[AUTH] Sending OTP to ${email} (role: ${role})`);
    
    // Check if we should use dev fallback
    if (FORCE_DEV_OTP) {
      console.log('[AUTH] Using dev OTP fallback');
      const devCode = String(Math.floor(100000 + Math.random() * 900000));
      console.log(`[DEV] OTP Code: ${devCode}`);
      
      const confirmationResult: PhoneConfirmationResult = {
        confirm: async (code: string) => {
          await new Promise(r => setTimeout(r, 500));
          if (String(code) !== devCode) {
            return { success: false, error: 'Invalid code' };
          }
          const user: User = {
            uid: email,
            name: name || email.split('@')[0],
            email,
            phone: '',
            photoURL: 'https://via.placeholder.com/40x40?text=U'
          };
          try { localStorage.setItem('fc_jwt', 'dev-token'); } catch {}
          return { success: true, user };
        }
      };
      return { success: true, confirmationResult };
    }

    // Try to send via API
    try {
      console.log(`[AUTH] Calling API: ${API_BASE_URL}/api/auth/send-otp`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, name }),
      });
      
      console.log(`[AUTH] Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('[AUTH] Failed to parse error response');
        }
        
        console.error('[AUTH] API error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[AUTH] OTP sent successfully:', data);
      
      // If email failed but OTP was generated (dev mode), show it to user
      if (data.devMode && data.otp) {
        console.log(`%c🔑 DEV MODE: Your OTP is ${data.otp}`, 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
        alert(`⚠️ Email sending failed!\n\n🔑 Your OTP: ${data.otp}\n\n(Check server console for details)\n\nThis is a temporary workaround. Please fix Gmail SMTP to send real emails.`);
      }
      
      const confirmationResult: PhoneConfirmationResult = {
        confirm: async (code: string) => {
          console.log(`[AUTH] Verifying code: ${code}`);
          
          const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
          });
          
          if (!verifyResponse.ok) {
            let verifyError: any = {};
            try {
              verifyError = await verifyResponse.json();
            } catch (e) {
              console.error('[AUTH] Failed to parse verify error');
            }
            return { success: false, error: verifyError.error || 'Verification failed' };
          }
          
          const verifyData = await verifyResponse.json();
          console.log('[AUTH] Verification successful:', verifyData);
          
          const token = verifyData.token || '';
          const userObj = verifyData.user || {};
          
          try { 
            if (token) localStorage.setItem('fc_jwt', token); 
          } catch {}
          
          const user: User = {
            uid: userObj._id || userObj.uid || email,
            name: userObj.name || email.split('@')[0],
            email: userObj.email || email,
            phone: userObj.phone || '',
            photoURL: 'https://via.placeholder.com/40x40?text=U'
          };
          
          return { success: true, user };
        }
      };
      
      return { success: true, confirmationResult };
      
    } catch (apiError: any) {
      console.error('[AUTH] API call failed:', apiError);
      
      // For production, fail if email can't be sent
      return {
        success: false,
        error: apiError.message || 'Email OTP failed. Please check server configuration.'
      };
    }
    
  } catch (error: any) {
    console.error('[AUTH] Email OTP error:', error);
    return {
      success: false,
      error: error.message || 'Email OTP failed. Please try again.'
    };
  }
};

// Password-based registration
export const registerWithPassword = async (payload: { name: string; email: string; phone?: string; password: string; role: 'farmer' | 'customer' }): Promise<AuthResult> => {
  try {
    console.log('[AUTH] Registering with password:', payload.email);
    console.log('[AUTH] API URL:', `${API_BASE_URL}/api/auth/signup`);
    
    const resp = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('[AUTH] Response status:', resp.status);
    
    if (resp.status === 404) {
      return { success: false, error: 'Server endpoint not found. Make sure backend is running on port 3001.' };
    }
    
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[AUTH] Server returned HTML instead of JSON. Backend may not be running.');
      return { success: false, error: 'Backend server not responding. Please start the server: cd server && node index.js' };
    }
    
    const data = await resp.json();
    console.log('[AUTH] Signup response:', data);
    if (!resp.ok || !data.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }
    return { success: true };
  } catch (e: any) {
    console.error('[AUTH] Signup error:', e);
    if (e.message.includes('Failed to fetch')) {
      return { success: false, error: 'Cannot connect to server. Please start backend: cd server && node index.js' };
    }
    return { success: false, error: e?.message || 'Registration failed' };
  }
};

// Password-based login
export const loginWithPassword = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log('[AUTH] Logging in with password:', email);
    const resp = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (resp.status === 404) {
      return { success: false, error: 'Server endpoint not found. Make sure backend is running on port 3001.' };
    }
    
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { success: false, error: 'Backend server not responding. Please start: cd server && node index.js' };
    }
    
    const data = await resp.json();
    console.log('[AUTH] Login response:', data);
    if (!resp.ok || !data.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }
    
    // Store authentication data
    try { 
      if (data.token) localStorage.setItem('fc_jwt', data.token);
      if (data.user?._id) localStorage.setItem('fc_user_id', data.user._id);
      if (data.user?.name) localStorage.setItem('farmconnect_userName', data.user.name);
      if (data.user?.email) localStorage.setItem('farmconnect_userEmail', data.user.email);
      if (data.user?.role) localStorage.setItem('farmconnect_userRole', data.user.role);
    } catch {}
    
    const user: User = {
      uid: data.user?._id || email,
      name: data.user?.name || email.split('@')[0],
      email: data.user?.email || email,
      phone: data.user?.phone || '',
      photoURL: 'https://via.placeholder.com/40x40?text=U'
    };
    return { success: true, user };
  } catch (e: any) {
    console.error('[AUTH] Login error:', e);
    return { success: false, error: e?.message || 'Login failed' };
  }
};

// Forgot password
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Request failed' };
  }
};

// Reset password
export const resetPasswordWithToken = async (token: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      return { success: false, error: data.error || 'Reset failed' };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Reset failed' };
  }
};

// Legacy email/password sign in (will be phased out)
export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Basic validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // For now, just return a mock user (replace with real auth later)
    const user: User = {
      uid: email,
      name: email.split('@')[0],
      email,
      phone: '',
      photoURL: 'https://via.placeholder.com/40x40?text=U'
    };

    try { localStorage.setItem('fc_jwt', 'mock-token'); } catch {}
    return { success: true, user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message || 'Sign in failed. Please try again.'
    };
  }
};

// Sign out function
export const signOut = async (): Promise<void> => {
  try {
    localStorage.removeItem('fc_jwt');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// Get current user from token
export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem('fc_jwt');
    if (!token) return null;
    
    // For now, return a mock user (replace with real token parsing later)
    return {
      uid: 'current-user',
      name: 'Current User',
      email: 'user@example.com',
      phone: '',
      photoURL: 'https://via.placeholder.com/40x40?text=U'
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}