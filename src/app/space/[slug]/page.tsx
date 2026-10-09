import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import PublicTestimonialForm from './PublicTestimonialForm';
import { Metadata } from 'next';
import { connection } from 'next/server';

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const space = await db.orm.public.Space.where({ slug }).first();
  if (!space) return { title: 'Space Not Found' };
  
  return {
    title: `${space.title} - Testimonials`,
    description: space.subtitle || `Submit a testimonial for ${space.title}`,
  };
}

export default async function PublicSpacePage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  
  const space = await db.orm.public.Space.where({ slug }).first();
  if (!space) {
    notFound();
  }

  // Theme-based class mapping
  const themeClasses: Record<string, string> = {
    default: 'bg-white text-gray-900 border-gray-200',
    dark: 'bg-gray-900 text-white border-gray-800',
    light: 'bg-gray-50 text-gray-900 border-gray-200',
    glass: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-white/20 shadow-xl',
    neon: 'bg-black text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    brutal: 'bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    corporate: 'bg-slate-50 text-slate-900 border-slate-200 shadow-sm rounded-none',
  };

  const containerClass = themeClasses[space.theme] || themeClasses.default;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-8 transition-colors ${space.theme === 'dark' || space.theme === 'neon' ? 'bg-black' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <div className={`w-full max-w-2xl p-8 sm:p-12 rounded-3xl border ${containerClass}`}>
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight mb-4">{space.title}</h1>
          {space.subtitle && (
            <p className="text-lg opacity-80">{space.subtitle}</p>
          )}
        </header>

        <PublicTestimonialForm 
          spaceId={space.id} 
          theme={space.theme} 
          fieldConfiguration={space.fieldConfiguration as any} 
        />
      </div>
    </div>
  );
}
