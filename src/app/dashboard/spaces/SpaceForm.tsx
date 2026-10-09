'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FieldConfig = {
  label: string;
  required: boolean;
  enabled: boolean;
};

type SpaceFormProps = {
  isEditing?: boolean;
  initialData?: any;
};

export default function SpaceForm({ isEditing = false, initialData = null }: SpaceFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [theme, setTheme] = useState(initialData?.theme || 'default');
  
  const defaultFields = {
    customerName: { label: 'Your Name', required: true, enabled: true },
    email: { label: 'Email Address', required: true, enabled: true },
    companyName: { label: 'Company Name', required: false, enabled: true },
    jobTitle: { label: 'Job Title', required: false, enabled: true },
    socialProfileUrl: { label: 'Social Profile URL', required: false, enabled: false },
    profilePhotoUrl: { label: 'Profile Photo', required: false, enabled: true },
    rating: { enabled: true },
  };

  const [fieldConfig, setFieldConfig] = useState(initialData?.fieldConfiguration || defaultFields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const url = isEditing ? `/api/spaces/${initialData.id}` : '/api/spaces';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          theme,
          fieldConfiguration: fieldConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      // WBS 1.3.4: display public URL after creation.
      // Redirect to the space management page (which could show the public URL)
      router.push(`/dashboard/spaces`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">Basic Information</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Space Name (Title)</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme Corp Product Launch"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle / Call to Action</label>
            <input 
              type="text" 
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Please share your experience working with us!"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Theme Settings */}
      <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">Appearance (Themes)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
          {['default', 'dark', 'light', 'glass', 'neon', 'brutal', 'corporate'].map((t) => (
            <label key={t} className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${theme === t ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <input 
                type="radio" 
                name="theme" 
                value={t} 
                checked={theme === t} 
                onChange={(e) => setTheme(e.target.value)} 
                className="sr-only" 
              />
              <span className="text-sm font-medium capitalize block">{t}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Field Configuration */}
      <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">Collection Form Fields</h2>
        <div className="space-y-4">
          {['customerName', 'email', 'companyName', 'jobTitle', 'socialProfileUrl', 'profilePhotoUrl'].map((key) => {
            const field = fieldConfig[key];
            return (
              <div key={key} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex flex-col flex-1 max-w-xs">
                    <span className="text-sm font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <input 
                      type="text" 
                      value={field.label}
                      onChange={(e) => setFieldConfig({...fieldConfig, [key]: { ...field, label: e.target.value }})}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    />
                  </div>
                  
                  <div className="flex gap-4 items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={field.enabled}
                        onChange={(e) => setFieldConfig({...fieldConfig, [key]: { ...field, enabled: e.target.checked }})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        disabled={key === 'customerName' || key === 'email'} // Keep required fields always enabled
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show Field</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={field.required}
                        onChange={(e) => setFieldConfig({...fieldConfig, [key]: { ...field, required: e.target.checked }})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        disabled={!field.enabled || key === 'customerName' || key === 'email'}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
             <div className="flex flex-col">
                <span className="text-sm font-medium">5-Star Rating</span>
                <span className="text-xs text-gray-500">Allow users to leave a star rating</span>
             </div>
             <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={fieldConfig.rating.enabled}
                  onChange={(e) => setFieldConfig({...fieldConfig, rating: { enabled: e.target.checked }})}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Enable Rating</span>
              </label>
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
        {isEditing ? (
          <button
            type="button"
            onClick={async () => {
              if (confirm('Are you sure you want to delete this space? This action cannot be undone and will delete all associated testimonials.')) {
                await fetch(`/api/spaces/${initialData.id}`, { method: 'DELETE' });
                router.push('/dashboard/spaces');
                router.refresh();
              }
            }}
            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
          >
            Delete Space
          </button>
        ) : <div />}
        
        <div className="flex gap-4">
          <Link href="/dashboard/spaces" className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Space')}
          </button>
        </div>
      </div>
    </form>
  );
}
