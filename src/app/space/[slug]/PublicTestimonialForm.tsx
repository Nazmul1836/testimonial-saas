'use client';

import { useState } from 'react';

type FieldConfig = {
  label: string;
  required: boolean;
  enabled: boolean;
};

type Props = {
  spaceId: string;
  theme: string;
  fieldConfiguration: Record<string, FieldConfig>;
};

export default function PublicTestimonialForm({ spaceId, theme, fieldConfiguration }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<number>(5);
  const [sharingConsent, setSharingConsent] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/spaces/${spaceId}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating: fieldConfiguration.rating?.enabled ? rating : undefined,
          sharingConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Theming classes for inputs and buttons
  const inputThemeClass = 
    theme === 'dark' || theme === 'neon' 
      ? 'bg-black/50 border-gray-700 text-white focus:border-primary focus:ring-primary placeholder-gray-500'
      : theme === 'brutal'
      ? 'bg-white border-4 border-black text-black focus:ring-0 focus:border-black rounded-none placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary placeholder-gray-400';

  const buttonThemeClass = 
    theme === 'neon'
      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]'
      : theme === 'brutal'
      ? 'bg-primary hover:bg-primary-hover text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] rounded-none'
      : theme === 'corporate'
      ? 'bg-slate-900 hover:bg-slate-800 text-white rounded-none'
      : 'bg-primary hover:bg-primary-hover text-white rounded-lg';

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="opacity-80">Your testimonial has been successfully submitted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Dynamic Fields */}
      {['customerName', 'email', 'companyName', 'jobTitle', 'socialProfileUrl', 'profilePhotoUrl'].map((key) => {
        const config = fieldConfiguration[key];
        if (!config || !config.enabled) return null;

        return (
          <div key={key}>
            <label className="block text-sm font-bold mb-1 opacity-90">
              {config.label} {config.required && <span className="text-red-500">*</span>}
            </label>
            {key === 'profilePhotoUrl' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  required={config.required && !formData[key]}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                        method: 'POST',
                        body: file,
                      });
                      const data = await res.json();
                      if (data.url) {
                        handleChange(key, data.url);
                      } else if (data.error) {
                        alert(`Upload failed: ${data.error}`);
                      }
                    } catch (err) {
                      console.error('Upload failed', err);
                      alert('Upload failed');
                    }
                  }}
                  className={`block w-full px-4 py-3 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 ${inputThemeClass}`}
                />
                {formData[key] && (
                  <p className="text-sm text-green-600 dark:text-green-400">✓ Photo uploaded successfully</p>
                )}
              </div>
            ) : (
              <input
                type={key === 'email' ? 'email' : key.includes('Url') ? 'url' : 'text'}
                required={config.required}
                value={formData[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className={`block w-full px-4 py-3 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 ${inputThemeClass}`}
                placeholder={`Enter your ${config.label.toLowerCase()}`}
              />
            )}
          </div>
        );
      })}

      {/* Star Rating */}
      {fieldConfiguration.rating?.enabled && (
        <div>
          <label className="block text-sm font-bold mb-2 opacity-90">Rating <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`focus:outline-none transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Testimonial Text */}
      <div>
        <label className="block text-sm font-bold mb-1 opacity-90">
          Your Testimonial <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={formData.testimonialText || ''}
          onChange={(e) => handleChange('testimonialText', e.target.value)}
          className={`block w-full px-4 py-3 rounded-xl border shadow-sm transition-all focus:outline-none focus:ring-2 resize-none ${inputThemeClass}`}
          placeholder="Write your testimonial here..."
        />
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3 mt-8">
        <div className="flex items-center h-5 mt-1">
          <input
            id="consent"
            type="checkbox"
            checked={sharingConsent}
            onChange={(e) => setSharingConsent(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>
        <label htmlFor="consent" className="text-sm opacity-80 cursor-pointer select-none">
          I give permission to use this testimonial across social channels and other marketing campaigns.
          <span className="block text-xs opacity-75 mt-1">Optional. Leave unchecked to share your feedback privately.</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-4 text-lg font-bold transition-all ${buttonThemeClass} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
      </button>
    </form>
  );
}
