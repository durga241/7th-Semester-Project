import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const TestSupabaseEmail = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testEmailOTP = async () => {
    if (!email) {
      setStatus('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setStatus('Sending email OTP...');

    try {
      const { sendEmailOtp } = await import('../services/authService');
      const result = await sendEmailOtp(email);

      if (result.success) {
        setStatus(`✅ Success! Check your email (${email}) for the OTP code.`);
        console.log('✅ Email OTP test successful:', result);
      } else {
        setStatus(`❌ Failed: ${result.error}`);
        console.error('❌ Email OTP test failed:', result);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('❌ Email OTP test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!email || !otpCode) {
      setStatus('Please enter email and OTP code');
      return;
    }

    setIsLoading(true);
    setStatus('Verifying OTP...');

    try {
      const { sendEmailOtp } = await import('../services/authService');
      // Reuse the confirmation flow: simulate we already called sendEmailOtp
      const confirmation = { confirm: async (code: string) => ({ ...(await (await import('../services/authService')).sendEmailOtp(email)).confirmationResult!.confirm(code) }) } as any;
      const outcome = await confirmation.confirm(otpCode);

      if (outcome.success) {
        setStatus(`✅ Verification successful! User: ${outcome.user?.email}`);
        console.log('✅ OTP verification successful:', outcome);
      } else {
        setStatus(`❌ Verification failed: ${outcome.error}`);
        console.error('❌ OTP verification failed:', outcome);
      }
    } catch (error: any) {
      setStatus(`❌ Verification error: ${error.message}`);
      console.error('❌ OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Supabase Email OTP Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Email Address</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        <Button 
          onClick={testEmailOTP}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send Email OTP'}
        </Button>

        <div>
          <Label htmlFor="test-otp">OTP Code</Label>
          <Input
            id="test-otp"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
        </div>

        <Button 
          onClick={verifyOTP}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </Button>

        {status && (
          <div className={`p-3 rounded-lg text-sm ${
            status.includes('✅') ? 'bg-green-100 text-green-800' : 
            status.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <strong>Instructions:</strong><br />
          1. Enter your email address<br />
          2. Click "Send Email OTP"<br />
          3. Check your email for the OTP code<br />
          4. Enter the code and click "Verify OTP"
        </div>
      </CardContent>
    </Card>
  );
};

export default TestSupabaseEmail;
