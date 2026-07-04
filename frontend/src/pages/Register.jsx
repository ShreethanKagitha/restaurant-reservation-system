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
    <div className="w-full flex flex-col justify-center animate-scale-in">
      
      <div className="space-y-3 animate-slide-up delay-100">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-elegant text-burgundy dark:text-gold">
          Create an Account
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
          Sign up to unlock seamless restaurant reservations and manage your priority seating.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5 animate-slide-up delay-200">
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

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 bg-burgundy hover:bg-[#601420] text-white shadow-[0_4px_20px_rgb(122,30,44,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgb(122,30,44,0.3)] active:translate-y-0"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 animate-slide-up delay-300">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-burgundy hover:text-[#601420] dark:text-gold dark:hover:text-[#F3E5AB] transition-colors hover:underline"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
};

export default Register;
