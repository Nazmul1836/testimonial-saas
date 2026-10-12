'use client';

import { useState } from 'react';

export default function ManageBillingButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleManage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        window.location.href = data.url;
      } else {
        alert(`Could not open billing portal: ${data.error}`);
        setIsLoading(false);
      }
    } catch {
      alert('An error occurred while opening the billing portal.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleManage}
      disabled={isLoading}
      className={`px-4 py-2 border border-gray-300 dark:border-gray-700 text-foreground text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
