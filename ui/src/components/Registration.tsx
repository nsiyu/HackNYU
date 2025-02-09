import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EmailStep } from './registration/EmailStep';
import { PasswordStep } from './registration/PasswordStep';
import { ProfileStep } from './registration/ProfileStep';

type Step = 'email' | 'password' | 'profile';

export function Registration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setStep('password');
  };

  const handlePasswordSubmit = (password: string, confirmPassword: string) => {
    setFormData(prev => ({ ...prev, password, confirmPassword }));
    setStep('profile');
  };

  const handleProfileSubmit = async (profile: { fullName: string; phone: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: profile.fullName,
            phone: profile.phone
          }
        }
      });

      if (error) throw error;
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="text-left mb-12">
          <Link to="/" className="font-display text-2xl font-bold text-primary mb-8 block">
            Radio
          </Link>
          <h1 className="text-4xl font-bold mb-4">Create your account</h1>
          <p className="text-xl text-gray-400">Access all that Radio has to offer with a single account</p>
        </div>

        <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-8 border border-secondary-light/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 'email' && (
            <EmailStep 
              onSubmit={handleEmailSubmit}
              initialEmail={formData.email}
            />
          )}
          {step === 'password' && (
            <PasswordStep
              email={formData.email}
              onBack={() => setStep('email')}
              onSubmit={handlePasswordSubmit}
            />
          )}
          {step === 'profile' && (
            <ProfileStep
              email={formData.email}
              onBack={() => setStep('password')}
              onSubmit={handleProfileSubmit}
              loading={loading}
            />
          )}
        </div>

        <div className="mt-8 text-sm text-gray-400 text-center">
          By creating an account you certify that you are over the age of 18 and agree to the{' '}
          <Link to="/privacy" className="text-primary hover:text-primary-light">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="text-primary hover:text-primary-light">
            Financial Privacy Notice
          </Link>
          .
        </div>
      </div>
    </div>
  );
} 