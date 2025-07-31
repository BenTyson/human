'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
  birthPlace: z.string().min(1, 'Birth place is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function InputForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Test Subject',
      birthDate: '1969-12-12',
      birthTime: '22:12',
      birthPlace: 'Fresno, CA, USA'
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Ensure proper date format for the API
      const formattedData = {
        ...data,
        birthPlace: data.birthPlace.trim(),
      };
      
      const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chart');
      }

      const result = await response.json();
      
      if (result.success) {
        // Store chart data in sessionStorage for now
        sessionStorage.setItem(`chart-${result.chartId}`, JSON.stringify(result.chart));
        
        // Redirect to chart results
        window.location.href = `/chart/${result.chartId}`;
      } else {
        throw new Error(result.error || 'Chart generation failed');
      }
      
    } catch (error) {
      console.error('Error generating chart:', error);
      alert('Error generating chart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Name (Optional)
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="Enter your name"
        />
      </div>

      {/* Birth Date Field */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700 mb-2">
          Birth Date *
        </label>
        <input
          {...register('birthDate')}
          type="date"
          id="birthDate"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        {errors.birthDate && (
          <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
        )}
      </div>

      {/* Birth Time Field */}
      <div>
        <label htmlFor="birthTime" className="block text-sm font-medium text-slate-700 mb-2">
          Birth Time *
        </label>
        <input
          {...register('birthTime')}
          type="time"
          id="birthTime"
          step="1"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        {errors.birthTime && (
          <p className="mt-1 text-sm text-red-600">{errors.birthTime.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Exact time is crucial for accurate results. If unknown, use 12:00 PM.
        </p>
      </div>

      {/* Birth Place Field */}
      <div>
        <label htmlFor="birthPlace" className="block text-sm font-medium text-slate-700 mb-2">
          Birth Place *
        </label>
        <input
          {...register('birthPlace')}
          type="text"
          id="birthPlace"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          placeholder="City, State/Province, Country"
        />
        {errors.birthPlace && (
          <p className="mt-1 text-sm text-red-600">{errors.birthPlace.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Example: New York, NY, USA or London, England, UK
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Chart...
            </span>
          ) : (
            'Generate My Human Design Chart'
          )}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-slate-600 hover:text-slate-800 text-sm underline"
        >
          ← Back to Home
        </button>
      </div>
    </form>
  );
}