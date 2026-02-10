'use client';

import { AlertCircle } from 'lucide-react';

import { ApiClientError } from '@/lib/api/client';

import { Button } from '../Button';

interface ErrorMessageProps {
  error: Error;
  retry?: () => void;
  title?: string;
}

export function ErrorMessage({ error, retry, title }: ErrorMessageProps) {
  const message =
    error instanceof ApiClientError
      ? error.data.message
      : error.message || 'Something went wrong';

  const errorTitle = title || 'Error';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold">{errorTitle}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
