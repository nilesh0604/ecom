import { Button } from '@/components/ui';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

/**
 * About Page
 *
 * Brand storytelling page featuring:
 * - Brand mission statement
 * - Founder story
 * - Values & sustainability
 * - Timeline/milestones
 * - Team section (optional)
 */

const MILESTONES = [
  { year: '2020', title: 'The Beginning', description: 'Started with a vision to bring quality products directly to customers.' },
  { year: '2021', title: 'Growing Community', description: 'Reached 1,000 happy customers and expanded our product catalog.' },
  { year: '2022', title: 'Sustainability Focus', description: 'Launched eco-friendly packaging and carbon-neutral shipping.' },
  { year: '2023', title: 'Global Reach', description: 'Expanded to serve customers in over 50 countries.' },
  { year: '2024', title: 'Innovation', description: 'Introduced AI-powered personalization and virtual try-on features.' },
  { year: '2025', title: 'Today', description: 'Continuing to innovate and delight customers worldwide.' },
];

const TEAM = [
  { name: 'Alex Chen', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  { name: 'Sarah Johnson', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
  { name: 'Michael Park', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { name: 'Emily Davis', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
];

const VALUES = [
  {
    title: 'Quality Without Compromise',
    description: 'We partner only with brands and artisans who share our commitment to excellence. Every product goes through rigorous quality checks.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: 'Sustainable Practices',
    description: 'From recycled packaging to carbon-neutral shipping, we are committed to minimizing our environmental footprint.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Customer First',
    description: 'Your satisfaction is our top priority. Our dedicated support team is here to help, and our return policy is hassle-free.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    description: 'We continuously invest in technology and experience to make shopping with us more enjoyable and seamless.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>Our Story - eCom</title>
        <meta
          name="description"
          content="Learn about eCom's mission to bring quality products directly to you. Our story, values, and commitment to excellence."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover opacity-10 dark:opacity-5"
          />
        </div>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Our Story
          </span>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Crafted for Excellence
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            We believe everyone deserves access to quality products that enhance their daily lives. 
            That belief drives everything we do.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"
                  alt="Our founder"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-indigo-600 p-6 text-white">
                <p className="text-3xl font-bold">2020</p>
                <p className="text-sm opacity-90">Year Founded</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                The Beginning
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                A Simple Idea, A Big Mission
              </h2>
              <div className="mt-6 space-y-4 text-lg text-gray-600 dark:text-gray-400">
                <p>
                  It started in a small apartment with a simple observation: finding quality products 
                  shouldn't be so hard. Too often, consumers are overwhelmed with choices, unsure of 
                  what's genuinely good and what's just marketing.
                </p>
                <p>
                  Our founder, Alex, spent months researching, testing, and curating products that 
                  truly delivered on their promises. The goal was simple – create a destination where 
                  every product earns its place through merit, not marketing budgets.
                </p>
                <p>
                  Today, that vision has grown into a global community of customers who trust us to 
                  bring them the best. But our commitment remains the same: quality, honesty, and a 
                  relentless focus on your satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              What We Stand For
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Our Core Values
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {VALUES.map((value, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Our Journey
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Milestones
            </h2>
          </div>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700 md:left-1/2 md:-translate-x-1/2" />
            
            <div className="space-y-8">
              {MILESTONES.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white md:left-1/2">
                    {milestone.year.slice(-2)}
                  </div>
                  
                  {/* Content */}
                  <div className={`ml-12 w-full md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {milestone.year}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {milestone.title}
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The People Behind eCom
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Meet Our Team
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              A passionate team dedicated to bringing you the best shopping experience.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Join Our Journey
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Experience the eCom difference. Browse our curated collection and find your next favorite product.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/products">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
