import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';

const Login = () => {
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
  const [authEmail, setAuthEmail] = useState('');
  
  // Extract where to redirect after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      otp: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    if (step === 1) {
      const response = await login({
        email: data.email,
        password: data.password
      });

      if (response.success) {
        if (response.requires2FA) {
          setAuthEmail(response.email);
          setStep(2);
          toast.info(response.message || 'Please enter the OTP sent to you.');
        } else {
          // Backward compatibility if 2FA wasn't required
          handleSuccess(data.rememberMe, data.email, response.message);
        }
      } else {
        toast.error(response.message || 'Login failed. Please verify credentials.');
      }
    } else if (step === 2) {
      const response = await verifyOTP({
        email: authEmail,
        otp: data.otp
      });

      if (response.success) {
        handleSuccess(data.rememberMe, authEmail, response.message);
      } else {
        toast.error(response.message || 'Invalid OTP. Please try again.');
      }
    }
  };

  const handleSuccess = (rememberMe, email, message) => {
    toast.success(message || 'Logged in successfully!');
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="w-full flex flex-col justify-center animate-scale-in">
      <div className="space-y-3 animate-slide-up delay-100">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-elegant text-burgundy dark:text-gold">
          {step === 1 ? 'Welcome Back' : 'Two-Factor Authentication'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
          {step === 1 
            ? 'Sign in to your account to securely manage your priority reservations.' 
            : `Please enter the 6-digit OTP sent to ${authEmail}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5 animate-slide-up delay-200">
        {step === 1 && (
          <>
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              error={errors.email}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <PasswordInput
              label="Password"
              name="password"
              placeholder="••••••••"
              error={errors.password}
              {...register('password', {
                required: 'Password is required'
              })}
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-burgundy focus:ring-burgundy cursor-pointer"
                  {...register('rememberMe')}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  Remember Me
                </label>
              </div>

              <div className="text-xs">
                <Link
                  to="/forgot-password"
                  className="font-bold text-burgundy hover:text-[#601420] dark:text-gold dark:hover:text-[#F3E5AB] transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <Input
            label="6-Digit OTP"
            type="text"
            name="otp"
            placeholder="123456"
            maxLength={6}
            className="tracking-[1em] text-center font-bold text-lg"
            error={errors.otp}
            {...register('otp', {
              required: 'OTP is required',
              pattern: {
                value: /^[0-9]{6}$/,
                message: 'OTP must be exactly 6 digits'
              }
            })}
          />
        )}

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 bg-burgundy hover:bg-[#601420] text-white shadow-[0_4px_20px_rgb(122,30,44,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgb(122,30,44,0.3)] active:translate-y-0"
            isLoading={isSubmitting}
          >
            {step === 1 ? 'Sign In' : 'Verify & Log In'}
          </Button>
        </div>
        
        {step === 2 && (
          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-burgundy dark:hover:text-gold transition-colors underline"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </form>

      {step === 1 && (
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 animate-slide-up delay-300">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-burgundy hover:text-[#601420] dark:text-gold dark:hover:text-[#F3E5AB] transition-colors hover:underline"
          >
            Register here
          </Link>
        </p>
      )}
    </div>
  );
};

export default Login;
