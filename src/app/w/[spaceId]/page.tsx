import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

export const instant = false;

export default async function WidgetPage({ params }: { params: Promise<{ spaceId: string }> }) {
  await connection();
  
  const { spaceId } = await params;

  // Find space
  const space = await db.orm.public.Space.where({ id: spaceId }).first();
  if (!space) notFound();

  // Find config
  const config = await db.orm.public.WidgetConfiguration.where({ spaceId }).first();
  
  // Only publicly eligible testimonials: visible, not deleted, and shared with consent
  const testimonials = await db.orm.public.Testimonial.where({ spaceId })
    .where((t) => t.hidden.eq(false))
    .where((t) => t.deletedAt.isNull())
    .where((t) => t.sharingConsent.eq(true))
    .orderBy((t) => t.createdAt.desc()) // Newest first
    .all();

  // Sort featured testimonials to the top in JS since boolean ordering might not be exposed on the field proxy
  testimonials.sort((a, b) => {
    if (a.featured === b.featured) return 0;
    return a.featured ? -1 : 1;
  });

  // Determine styling based on config
  const themeMode = config?.themeMode || 'light';
  const bgColor = config?.backgroundColor || (themeMode === 'light' ? '#ffffff' : '#111827');
  const textColor = themeMode === 'light' ? '#111827' : '#ffffff';
  const cardBg = themeMode === 'light' ? '#f9fafb' : '#1f2937';
  const cardBorder = themeMode === 'light' ? '#e5e7eb' : '#374151';

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      {testimonials.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
          No testimonials to display yet.
        </div>
      ) : (
        <div 
          style={{
            display: config?.layout === 'grid' ? 'grid' : config?.layout === 'carousel' ? 'flex' : 'block',
            gridTemplateColumns: config?.layout === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
            gap: '1rem',
            overflowX: config?.layout === 'carousel' ? 'auto' : 'visible',
            paddingBottom: config?.layout === 'carousel' ? '1rem' : 0,
            columnCount: config?.layout === 'masonry' ? 3 : undefined,
            columnGap: '1rem',
          }}
        >
          {testimonials.map((t) => (
            <div 
              key={t.id} 
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: config?.layout === 'masonry' ? '1rem' : 0,
                breakInside: 'avoid',
                minWidth: config?.layout === 'carousel' ? '300px' : undefined,
              }}
            >
              {/* Stars */}
              {space.ratingEnabled && t.rating && (
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} style={{ width: '1.25rem', height: '1.25rem', color: '#fbbf24' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
              
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                "{t.testimonialText}"
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {t.profilePhotoUrl ? (
                  <img src={t.profilePhotoUrl} alt={t.customerName} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {t.customerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>{t.customerName}</p>
                  {(t.jobTitle || t.companyName) && (
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                      {t.jobTitle} {t.jobTitle && t.companyName && 'at '} {t.companyName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Hide scrollbar for carousel but keep functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          div[style*="columnCount: 3"] { column-count: 1 !important; }
        }
      `}} />
    </div>
  );
}
