import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment (Vite)
// Do NOT hardcode credentials. Provide them via .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Surface a clear warning during development without leaking secrets
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure them in your .env file.');
}

// Create Supabase client with error handling
export const supabase = createClient(String(supabaseUrl), String(supabaseKey), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Test Supabase connection on initialization
try {
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.log('Supabase session error:', error.message);
    } else {
      console.log('Supabase connected successfully');
    }
  });
} catch (error) {
  console.error('Supabase connection error:', error);
}

// Authentication functions using Supabase
export const authService = {
// Email OTP sign in
async signInWithOtp({ email }: { email: string }) {
  try {
    console.log('🔍 Attempting to send email OTP to:', email);
    console.log('🔍 Supabase URL:', supabaseUrl);
    console.log('🔍 Environment:', window.location.origin);
    
    // First check if Supabase is properly configured
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔍 Supabase auth check:', { user: !!user, error: userError?.message });
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      // In dev, avoid redirect URLs which can block delivery if not whitelisted
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('❌ Supabase email OTP error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
      
      // Check if it's a configuration error
      if (error.message.includes('disabled') || error.message.includes('not enable')) {
        throw new Error('Email OTP is not enabled in Supabase dashboard. Please enable it in Authentication > Settings > Email providers.');
      }
      
      throw error;
    }

    console.log('✅ Supabase email OTP sent successfully:', data);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('❌ Email OTP error:', error);
    return {
      success: false,
      error: error.message
    };
  }
},

  // Verify OTP
  async verifyOtp({ email, token, type }: { email: string; token: string; type: string }) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        // Force email verification type to avoid mismatches
        type: 'email' as any
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  // Email sign up
  async signUpWithEmail(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Email sign in
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Phone sign in
  async signInWithPhone(phone: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: 'sms'
        }
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },


  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      return user;
    } catch (error: any) {
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    supabase.auth.onAuthStateChange(callback);
  }
};
