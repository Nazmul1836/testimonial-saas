import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="w-full glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">TrustFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-hover hover:scale-105 transition-all shadow-lg hover:shadow-primary/30">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-32 lg:py-48 overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-700 dark:text-primary-300 text-sm font-semibold mb-8 animate-fade-in-up border border-primary/20">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-slow"></span>
          TrustFlow 1.0 is now live
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tight text-foreground max-w-5xl mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Collect beautiful <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">testimonials</span> from your customers.
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Easily gather text and video testimonials from your happiest customers without needing a developer. Embed them anywhere to boost your conversion rates.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/register" className="w-full sm:w-auto text-lg font-bold bg-primary text-white px-10 py-5 rounded-full hover:bg-primary-hover hover:scale-105 transition-all shadow-xl hover:shadow-primary/40 flex items-center justify-center gap-2">
            Start for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
          <Link href="#features" className="w-full sm:w-auto text-lg font-bold text-foreground glass px-10 py-5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center border border-gray-200 dark:border-gray-800">
            View demo
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500 font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          No credit card required • 14-day free trial on Pro
        </p>
      </section>

      {/* Feature Preview Section */}
      <section id="features" className="py-32 relative z-10 glass border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-6">Everything you need to build trust</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xl">Our platform gives you the tools to collect, manage, and display testimonials effortlessly.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl glass hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/30">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Dedicated Collection Spaces</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Create a beautiful, branded landing page where customers can leave text or video reviews in seconds.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-8 rounded-3xl glass hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/30">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Beautiful Wall of Love</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Embed your best testimonials anywhere on your website with a single line of code. Custom themes included.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-8 rounded-3xl glass hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/30">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Complete Moderation</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">You're in control. Review, feature, or hide testimonials from your dashboard before they go live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative z-10 glass border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="glass p-10 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 flex flex-col hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-3xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 mb-8 text-lg">Perfect for side projects and testing the waters.</p>
              <div className="mb-10">
                <span className="text-6xl font-black">$0</span>
                <span className="text-gray-500 text-lg">/month</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-lg">Up to 3 Collection Spaces</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-lg">Up to 100 Testimonials</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-lg">Basic Wall of Love Embed</span>
                </li>
              </ul>
              <Link href="/register" className="w-full py-5 text-lg text-center rounded-2xl font-bold border-2 border-gray-200 dark:border-gray-800 hover:border-primary hover:text-primary transition-colors">
                Start for free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="glass p-10 rounded-3xl border-2 border-primary shadow-2xl shadow-primary/20 flex flex-col relative hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-gradient-to-r from-primary to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">Most Popular</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">Pro</h3>
              <p className="text-gray-500 mb-8 text-lg">For growing businesses that need unlimited power.</p>
              <div className="mb-10">
                <span className="text-6xl font-black">$29</span>
                <span className="text-gray-500 text-lg">/month</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-bold text-lg">Unlimited Collection Spaces</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-bold text-lg">Unlimited Testimonials</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-lg">Premium Wall of Love Themes</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-lg">Priority Support</span>
                </li>
              </ul>
              <Link href="/register" className="w-full py-5 text-lg text-center rounded-2xl font-bold bg-primary text-white hover:bg-primary-hover shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <span className="font-heading font-semibold text-lg">TrustFlow</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">© 2026 TrustFlow SaaS. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
