import Link from 'next/link'
import {
  CheckCircle,
  Star,
  Calendar,
  Layers,
  Filter,
  Tag,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">TaskFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</a>
            <a href="#subtasks" className="text-gray-600 hover:text-gray-900 text-sm font-medium">3-Layer Tasks</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Organize your work & life</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Organize your<br />
            <span className="text-violet-600">work & life</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            TaskFlow is the intuitive task manager that helps you capture, organize, and complete tasks — from quick errands to complex projects with multiple sub-tasks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="bg-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-violet-700 transition inline-flex items-center gap-2 shadow-lg shadow-violet-200">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="text-gray-600 px-8 py-3.5 rounded-xl font-medium text-lg hover:bg-gray-50 transition inline-flex items-center gap-2">
              See Features
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-gray-500">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-medium text-gray-900">4.8/5</span>
            <span>•</span>
            <span> Loved by 50,000+ users</span>
          </div>
        </div>

        {/* Hero Image / Demo */}
        <div className="max-w-5xl mx-auto mt-16 px-4">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-4 shadow-2xl shadow-violet-100/50">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              {/* Quick Add Demo */}
              <div className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 font-mono text-sm">
                    Buy groceries tomorrow at 5pm #errands p1
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 border-2 border-violet-500 rounded flex-shrink-0"></div>
                    <span className="font-medium text-gray-900">Buy groceries</span>
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">errands</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded ml-auto">p1</span>
                    <span className="text-xs text-gray-500">Tomorrow 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Powerful features to help you manage tasks of any complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Quick Add',
                description: 'Type naturally: "Buy milk tomorrow at 5pm #shopping p1" — TaskFlow parses it all instantly.',
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Due Dates & Times',
                description: 'Set due dates with smart recognition. Get reminded at the right moment.',
              },
              {
                icon: <Layers className="w-6 h-6" />,
                title: '3-Layer Subtasks',
                description: 'Break down complex projects into Master Tasks → Sub-tasks → Sub-sub-tasks.',
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Today & Upcoming',
                description: 'Dedicated views for your daily tasks and the week ahead.',
              },
              {
                icon: <Filter className="w-6 h-6" />,
                title: 'Custom Filters',
                description: 'Create powerful filters to find exactly the tasks you need.',
              },
              {
                icon: <Tag className="w-6 h-6" />,
                title: 'Labels',
                description: 'Tag tasks across projects with color-coded labels.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-violet-50 transition">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Layer Subtasks Showcase */}
      <section id="subtasks" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Layers className="w-4 h-4" />
                <span>Unique Feature</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                3-Layer Sub-task<br />Hierarchy
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Unlike other task managers, TaskFlow supports true sub-task nesting. Break complex projects into manageable pieces — then break those pieces down further.
              </p>
              <ul className="space-y-4">
                {[
                  'Master Task — Your main goal or project',
                  'Sub-task — Major steps to complete it',
                  'Sub-sub-task — granular action items',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Demo */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
              <div className="space-y-4">
                {/* Layer 1 */}
                <div className="bg-white rounded-xl p-4 border-2 border-violet-300 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-violet-500 rounded flex-shrink-0"></div>
                    <span className="font-semibold text-gray-900">Plan company retreat</span>
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded ml-auto">Layer 1</span>
                  </div>
                </div>

                {/* Layer 2 */}
                <div className="ml-8 space-y-3">
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 rounded flex-shrink-0"></div>
                      <span className="font-medium text-gray-900">Book venue</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-auto">Layer 2</span>
                    </div>
                    {/* Layer 3 */}
                    <div className="ml-7 mt-3 space-y-2">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-400 rounded flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">Research venues online</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-auto">Layer 3</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-400 rounded flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">Contact top 3 options</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-auto">Layer 3</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 rounded flex-shrink-0"></div>
                      <span className="font-medium text-gray-900">Arrange transport</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-auto">Layer 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Views Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Multiple views for every workflow
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Switch between views depending on what you need to see.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Today', description: 'All tasks due today, grouped by project' },
              { title: 'Upcoming', description: 'Rolling 7-day view of upcoming tasks' },
              { title: 'Calendar', description: 'Monthly calendar with task dots (Pro)' },
            ].map((view, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-violet-50 transition">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{view.title}</h3>
                <p className="text-gray-500">{view.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-500">
              Start free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-500 mb-6">For individuals getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '5 personal projects',
                  '3 custom filters',
                  'Today & Upcoming views',
                  'Basic Quick Add',
                  '5MB file uploads',
                  'Email support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block text-center w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-violet-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-violet-200 mb-6">For power users who want it all</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$1</span>
                <span className="text-violet-200">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited projects',
                  'Unlimited filters',
                  'Calendar view',
                  'Advanced Quick Add',
                  '100MB file uploads',
                  'Unlimited activity history',
                  'All themes',
                  'Priority support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-violet-100">
                    <CheckCircle className="w-5 h-5 text-violet-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?plan=pro" className="block text-center w-full py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition">
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get organized?
          </h2>
          <p className="text-xl text-violet-200 mb-10">
            Join thousands of people who use TaskFlow to be more productive.
          </p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-violet-50 transition shadow-xl">
            Start for Free — No Credit Card
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="font-bold text-white">TaskFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/auth/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-white transition">Sign Up</Link>
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
            </div>
            <div className="text-sm">
              © 2024 TaskFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
