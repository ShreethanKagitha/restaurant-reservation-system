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
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign up to make restaurant reservations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Min 8 characters"
          error={errors.password}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters long'
            }
          })}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Repeat password"
          error={errors.confirmPassword}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === passwordVal || 'Passwords do not match'
          })}
        />

        <Button
          type="submit"
          className="w-full animate-pulse-slow"
          isLoading={isSubmitting}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
};

export default Register;
