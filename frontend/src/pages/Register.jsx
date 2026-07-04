import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    const response = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword
    });

    if (response.success) {
      toast.success(response.message || 'Registration successful!');
      navigate('/dashboard');
    } else {
      toast.error(response.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 premium-gradient opacity-10 dark:opacity-20 pointer-events-none" />
      
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-burgundy/10 dark:border-gold/20 animate-scale-in">
        
        {/* Left Side: Creative Image Pane */}
        <div 
          className="w-full md:w-5/12 h-64 md:h-auto bg-cover bg-center relative hidden sm:block"
          style={{ backgroundImage: `url('/restaurant_ambience.png')` }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white space-y-4 animate-slide-up delay-200">
            <h3 className="text-3xl font-elegant font-bold tracking-wide">ReserveTable</h3>
            <p className="text-sm text-slate-200 leading-relaxed max-w-xs">
              Join our exclusive culinary network and secure priority seating at world-class establishments.
            </p>
          </div>
        </div>

        {/* Right Side: Form Pane */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
          
          <div className="space-y-2 animate-slide-up delay-100">
            <h2 className="text-3xl font-bold tracking-tight font-elegant text-burgundy dark:text-gold">
              Create an Account
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign up to unlock seamless restaurant reservations.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 animate-slide-up delay-300">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              error={errors.name}
              {...register('name', {
                required: 'Name is required',
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters'
                }
              })}
            />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <PasswordInput
                label="Password"
                name="password"
                placeholder="Min 8 chars"
                error={errors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'At least 8 characters'
                  }
                })}
              />

              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Repeat password"
                error={errors.confirmPassword}
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (value) => value === passwordVal || 'Passwords mismatch'
                })}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-burgundy hover:bg-[#601420] text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 animate-slide-up delay-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-burgundy hover:text-[#601420] dark:text-gold dark:hover:text-[#F3E5AB] transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
