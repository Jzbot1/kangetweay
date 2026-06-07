import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import ROUTES from '../constants/routes.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: signUp, isRegistering } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFields) => {
    try {
      await signUp(data);
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    } catch (err) {
      // Handled by hook toasts
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 select-text">
      {/* Glow decorative backdrop */}
      <div className="absolute w-[350px] h-[350px] bg-brand/10 blur-[90px] rounded-full top-1/4 left-1/4" />
      <div className="absolute w-[300px] h-[300px] bg-brand/5 blur-[90px] rounded-full bottom-1/4 right-1/4" />

      <div className="w-full max-w-md bg-dark-surface border border-dark-border p-8 rounded-card shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center select-none">
          <Link to={ROUTES.LANDING} className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center mb-1">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </Link>
          <h2 className="text-xl font-bold text-gray-200">Create Account</h2>
          <p className="text-xs text-gray-500">Sign up and integrate your MooGold top-ups in minutes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            disabled={isRegistering}
            {...register('name')}
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="name@company.com"
            error={errors.email?.message}
            disabled={isRegistering}
            {...register('email')}
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isRegistering}
            {...register('password')}
          />

          <Button type="submit" variant="primary" className="w-full h-11 mt-2 font-semibold text-sm" loading={isRegistering}>
            Create Account
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-gray-500 border-t border-dark-border/40 pt-5">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-brand hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
