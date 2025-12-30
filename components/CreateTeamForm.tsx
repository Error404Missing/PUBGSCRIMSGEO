'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const teamSchema = z.object({
  name: z.string().min(2, { message: "გუნდის სახელი უნდა იყოს მინიმუმ 2 სიმბოლო" }),
  tag: z.string().min(2, { message: "თეგი მინიმუმ 2 სიმბოლო" }).max(5, { message: "თეგი მაქსიმუმ 5 სიმბოლო" }),
  playerCount: z.coerce.number().min(1).max(10), 
  mapsCount: z.coerce.number().min(0),
});

export default function CreateTeamForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<z.output<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
        playerCount: 4,
        mapsCount: 3
    }
  });

  async function onSubmit(values: z.output<typeof teamSchema>) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'გუნდის შექმნა ვერ მოხერხდა');
      }

      router.push('/teams');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       {/* Team Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          გუნდის სახელი
        </label>
        <div className="mt-1">
          <input
            id="name"
            type="text"
            {...register("name")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
      </div>

      {/* Team Tag */}
      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-gray-300">
          კლანის თეგი (Tag)
        </label>
        <div className="mt-1">
          <input
            id="tag"
            type="text"
            placeholder="MIBR"
            {...register("tag")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.tag && <p className="text-red-500 text-xs mt-1">{errors.tag.message}</p>}
        </div>
      </div>

      {/* Player Count */}
      <div>
        <label htmlFor="playerCount" className="block text-sm font-medium text-gray-300">
          მოთამაშეების რაოდენობა
        </label>
        <div className="mt-1">
          <input
            id="playerCount"
            type="number"
            {...register("playerCount")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.playerCount && <p className="text-red-500 text-xs mt-1">{errors.playerCount.message}</p>}
        </div>
      </div>
      
      {/* Maps Count */}
      <div>
        <label htmlFor="mapsCount" className="block text-sm font-medium text-gray-300">
          რამდენ მაპს ითამაშებთ?
        </label>
        <div className="mt-1">
          <input
            id="mapsCount"
            type="number"
            {...register("mapsCount")}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm placeholder-gray-500 bg-neutral-900 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          />
          {errors.mapsCount && <p className="text-red-500 text-xs mt-1">{errors.mapsCount.message}</p>}
        </div>
      </div>

      <div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
        >
          {isLoading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm text-center">
            {error}
        </div>
      )}
    </form>
  );
}
