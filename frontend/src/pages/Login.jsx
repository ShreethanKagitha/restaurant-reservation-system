import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    const response = await login({
      email: data.email,
      password: data.password
    });

    if (response.success) {
      toast.success(response.message || 'Logged in successfully!');
      
      // Save Remember Me configuration if selected
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate(from, { replace: true });
    } else {
      toast.error(response.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="w-full flex flex-col justify-center animate-scale-in">
      <div className="space-y-3 animate-slide-up delay-100">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-elegant text-burgundy dark:text-gold">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
          Sign in to your account to securely manage your priority reservations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5 animate-slide-up delay-200">
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

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 bg-burgundy hover:bg-[#601420] text-white shadow-[0_4px_20px_rgb(122,30,44,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgb(122,30,44,0.3)] active:translate-y-0"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 animate-slide-up delay-300">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-burgundy hover:text-[#601420] dark:text-gold dark:hover:text-[#F3E5AB] transition-colors hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
