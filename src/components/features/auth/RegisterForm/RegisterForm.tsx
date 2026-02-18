/**
 * RegisterForm Component
 *
 * Form for user registration with name, email, password, and confirm password.
 * Includes password strength meter and visibility toggle.
 *
 * @module components/features/auth/RegisterForm
 */

'use client';

import { Check, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/hooks/useZodForm';
import { cn } from '@/lib/utils';
import {
  type RegisterInput,
  registerSchema,
} from '@/lib/validation/schemas/user';

export interface RegisterFormProps {
  /** Callback URL after successful registration */
  callbackUrl?: string;
}

/**
 * Registration form with name, email, password, confirm password
 */
export function RegisterForm({ callbackUrl = '/lists' }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Extend schema for client-side validtion if needed, but we updated the shared schema
  const form = useZodForm(registerSchema, {
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  // Calculate password strength (0-4)
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError(null);

    try {
      // Register user via API
      // Note: We send confirmPassword but API ignores it (safe)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        return;
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          'Registration successful but login failed. Please try logging in.'
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <FormField name="name">
          <FormItem>
            <FormLabel required>Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={isLoading}
                {...form.register('name')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="email">
          <FormItem>
            <FormLabel required>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...form.register('email')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="password">
          <FormItem>
            <FormLabel required>Password</FormLabel>
            <FormControl>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...form.register('password')}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </FormControl>
            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1">
                <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-secondary">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-full flex-1 transition-all duration-300',
                        i < strength
                          ? strength < 2
                            ? 'bg-red-500'
                            : strength < 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {strength < 2
                    ? 'Too weak. Use 8+ chars mix of upper, lower, numbers.'
                    : strength < 3
                      ? 'Fairly strong. Adding special chars helps.'
                      : strength < 4
                        ? 'Good strength. Hard to guess.'
                        : 'Excellent! Very strong password.'}
                </p>
              </div>
            )}
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="confirmPassword">
          <FormItem>
            <FormLabel required>Confirm Password</FormLabel>
            <FormControl>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...form.register('confirmPassword')}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </FormControl>
            {/* Match Indicator */}
            {form.watch('confirmPassword') && (
              <p
                className={cn(
                  'text-xs transition-colors',
                  form.watch('confirmPassword') === password
                    ? 'font-medium text-green-600'
                    : 'text-muted-foreground'
                )}
              >
                {form.watch('confirmPassword') === password ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </span>
                ) : (
                  'Passwords must match'
                )}
              </p>
            )}
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>
    </Form>
  );
}
