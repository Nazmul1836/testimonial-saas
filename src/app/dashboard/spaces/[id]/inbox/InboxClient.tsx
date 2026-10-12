'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Testimonial = {
  id: string;
  customerName: string;
  email: string;
  companyName: string | null;
  jobTitle: string | null;
  testimonialText: string;
  rating: number | null;
  sharingConsent: boolean;
  featured: boolean;
  favorite: boolean;
  hidden: boolean;
  createdAt: string;
};

export default function InboxClient({ spaceId, initialData, initialMeta }: { spaceId: string, initialData: Testimonial[], initialMeta: any }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialData);
  const [meta, setMeta] = useState(initialMeta);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Skip first render if using initial data with no filters
    if (search === '' && filter === 'all' && page === 1 && testimonials.length === initialData.length) {
      return;
    }

    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          q: search,
          filter,
          page: page.toString()
        });
        const res = await fetch(`/api/spaces/${spaceId}/testimonials?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setTestimonials(data.data.data);
          setMeta(data.data.meta);
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchTestimonials, 300);
    return () => clearTimeout(debounce);
  }, [search, filter, page, spaceId]);

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    // Optimistic update
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    try {
      await fetch(`/api/spaces/${spaceId}/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      // Revert on error (could be better)
      console.error(err);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    // Optimistic update
    setTestimonials(prev => prev.filter(t => t.id !== id));
    setMeta((prev: typeof meta) => ({ ...prev, total: prev.total - 1 }));

    try {
      await fetch(`/api/spaces/${spaceId}/testimonials/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <input 
            type="text"
            placeholder="Search name, email, or content..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <svg className="w-4 h-4 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['all', 'favorite', 'featured', 'hidden'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}

      {!isLoading && testimonials.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No testimonials found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className={`bg-white dark:bg-gray-900 border ${t.featured ? 'border-primary shadow-md' : 'border-gray-100 dark:border-gray-800 shadow-sm'} rounded-xl p-6 flex flex-col sm:flex-row gap-6 transition-all`}>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{t.customerName}</h3>
                    {t.rating && (
                      <div className="flex text-yellow-400">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className={`text-gray-700 dark:text-gray-300 italic mb-4 ${t.hidden ? 'opacity-50' : ''}`}>"{t.testimonialText}"</p>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-2">
                  {t.email && <span>{t.email}</span>}
                  {t.jobTitle && t.companyName && <span>{t.jobTitle} at {t.companyName}</span>}
                  {t.sharingConsent ? (
                    <span className="text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">Consent Given</span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Private — not shown in widget</span>
                  )}
                </div>
              </div>
              
              <div className="flex sm:flex-col flex-wrap gap-2 justify-start sm:w-32">
                <button 
                  onClick={() => updateTestimonial(t.id, { favorite: !t.favorite })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${t.favorite ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 text-yellow-700 dark:text-yellow-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {t.favorite ? '★ Favorited' : '☆ Favorite'}
                </button>
                <button 
                  onClick={() => updateTestimonial(t.id, { featured: !t.featured })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${t.featured ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {t.featured ? 'Featured' : 'Feature'}
                </button>
                <button 
                  onClick={() => updateTestimonial(t.id, { hidden: !t.hidden })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${t.hidden ? 'bg-gray-800 text-white border-gray-900' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {t.hidden ? 'Hidden' : 'Hide'}
                </button>
                <button 
                  onClick={() => deleteTestimonial(t.id)}
                  className="px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500 flex items-center">
            Page {page} of {meta.totalPages}
          </span>
          <button 
            disabled={page >= meta.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
