import SpaceForm from '../SpaceForm';
import Link from 'next/link';

export default function NewSpacePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/spaces" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Create New Space</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure how you want to collect testimonials.</p>
        </div>
      </div>

      <SpaceForm isEditing={false} />
    </div>
  );
}
