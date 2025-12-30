'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions/auth';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
 
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
    >
      {pending ? 'შესვლა...' : 'შესვლა'}
    </button>
  );
}

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
 
  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          პაროლი
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-yellow-500 hover:text-yellow-400">
            დაგავიწყდა პაროლი?
          </a>
        </div>
      </div>

      <div>
        <SubmitButton />
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm text-center">
            {errorMessage}
        </div>
      )}
      
      <div className="text-center text-sm text-gray-400">
        არ გაქვს ანგარიში?{' '}
        <Link href="/register" className="font-medium text-yellow-500 hover:text-yellow-400">
            რეგისტრაცია
        </Link>
      </div>
    </form>
  );
}
