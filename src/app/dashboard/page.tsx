import { getSession } from '@/lib/auth';
import { db } from '@/prisma/db';
import Link from 'next/link';
import { Temporal } from 'temporal-polyfill';
import DashboardChart from './DashboardChart';

export const instant = false;

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) return null;

  // Independent queries run in parallel: each one is a round trip to the database
  const [user, subscription, userSpaces] = await Promise.all([
    db.orm.public.User.where({ id: session.userId }).first(),
    db.orm.public.Subscription.where({ userId: session.userId }).first(),
    // Since we don't have a direct relation between User -> Testimonials, we find the user's spaces first.
    db.orm.public.Space.select('id', 'title').where({ ownerId: session.userId }).all(),
  ]);
  const isFreePlan = !subscription || subscription.plan === 'free';
  const spacesCount = userSpaces.length;
  const spaceIds = userSpaces.map(s => s.id);

  let testimonialsCount = 0;
  let recentTestimonials: any[] = [];
  let chartData: { date: string, count: number }[] = [];

  if (spaceIds.length > 0) {
    const testimonialsQuery = db.orm.public.Testimonial.where((t) => t.spaceId.in(spaceIds)).where((t) => t.deletedAt.isNull());
    // The chart covers at most the last 91 days, so only those rows are loaded
    const chartStart = Temporal.Now.instant().subtract({ hours: 91 * 24 });

    const [testimonialsResult, recent, allTestimonials] = await Promise.all([
      testimonialsQuery.aggregate((a) => ({ count: a.count() })),
      testimonialsQuery.orderBy((t) => t.createdAt.desc()).limit(5).all(),
      testimonialsQuery.where((t) => t.createdAt.gte(chartStart)).select('createdAt').all(),
    ]);
    testimonialsCount = testimonialsResult.count;
    recentTestimonials = recent;

    // Aggregate for chart
    const dailyMap = allTestimonials.reduce((acc, t) => {
      const date = t.createdAt.toString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Fill last 90 days to ensure chart has a continuous timeline
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        count: dailyMap[dateStr] || 0
      });
    }
  } else {
    // Empty chart for 90 days if no spaces
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      chartData.push({ date: d.toISOString().split('T')[0], count: 0 });
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name || session.email}</p>
      </header>

      {isFreePlan && (
        <div className="bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-primary-700 dark:text-primary-400">You are on the Free Plan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upgrade to Pro for up to 25 spaces and 1,000 testimonials per space.</p>
          </div>
          <Link href="/dashboard/settings#billing" className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors whitespace-nowrap shadow-sm hover:shadow-md">
            Upgrade to Pro
          </Link>
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Spaces</h2>
          <p className="text-4xl font-black text-foreground mt-4">{spacesCount}</p>
          {isFreePlan && <p className="text-xs text-gray-400 mt-2">{spacesCount} / 3 spaces used</p>}
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Testimonials</h2>
          <p className="text-4xl font-black text-primary mt-4">{testimonialsCount}</p>
          {isFreePlan && <p className="text-xs text-gray-400 mt-2">{testimonialsCount} / 100 limit per space</p>}
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Conversion Rate</h2>
          <p className="text-4xl font-black text-green-500 mt-4">--%</p>
          <p className="text-xs text-gray-400 mt-2">Coming soon</p>
        </div>
      </section>

      <DashboardChart rawData={chartData} />

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link href="/dashboard/spaces" className="text-sm font-medium text-primary hover:underline">View All Spaces</Link>
          </div>
          
          {recentTestimonials.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No testimonials yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTestimonials.map((t) => {
                const space = userSpaces.find(s => s.id === t.spaceId);
                return (
                  <div key={t.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                      {t.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm truncate">{t.customerName}</p>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(t.createdAt.toString()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 truncate">in {space?.title || 'Unknown Space'}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">"{t.testimonialText}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-6">Quick Links</h2>
          <div className="space-y-3">
            <Link href="/dashboard/spaces/new" className="block p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-colors group">
              <h3 className="font-bold text-sm group-hover:text-primary transition-colors">Create New Space</h3>
              <p className="text-xs text-gray-500 mt-1">Setup a new collection form</p>
            </Link>
            <Link href="/dashboard/spaces" className="block p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-colors group">
              <h3 className="font-bold text-sm group-hover:text-primary transition-colors">Manage Widget</h3>
              <p className="text-xs text-gray-500 mt-1">Embed your Wall of Love</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
