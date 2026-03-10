import { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Users,
  Building2,
  AlertTriangle,
  Search,
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  MapPin,
} from 'lucide-react';
import { getStats } from '../api';

interface HeroPageProps {
  onFindFood: () => void;
  onDonateFood: () => void;
}

export default function HeroPage({ onFindFood, onDonateFood }: HeroPageProps) {
  const [stats, setStats] = useState({ meals: 0, donors: 0, ngos: 0, wasted: '2.1M tons' });

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const statCards = [
    {
      icon: <UtensilsCrossed size={24} />,
      value: stats.meals.toLocaleString() + '+',
      label: 'Meals Rescued',
      color: 'from-emerald-400 to-emerald-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      icon: <Users size={24} />,
      value: stats.donors.toLocaleString() + '+',
      label: 'Active Donors',
      color: 'from-primary-400 to-primary-600',
      bg: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      icon: <Building2 size={24} />,
      value: stats.ngos.toLocaleString() + '+',
      label: 'NGO Partners',
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      icon: <AlertTriangle size={24} />,
      value: stats.wasted,
      label: 'Food Wasted Yearly',
      color: 'from-amber-400 to-amber-600',
      bg: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  const features = [
    {
      icon: <Clock size={28} />,
      title: 'Real-Time Alerts',
      description: 'Get notified instantly when surplus food is available near you.',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: <MapPin size={28} />,
      title: 'Location Based',
      description: 'Find food donations in your city and neighborhood easily.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: <Shield size={28} />,
      title: 'Verified Partners',
      description: 'All donors and NGOs are verified for safe food sharing.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: <Heart size={28} />,
      title: 'Zero Waste Mission',
      description: 'Join the movement to eliminate food waste and feed those in need.',
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          {/* Dots pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Text */}
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-sm font-medium text-primary-100">Reducing food waste, one meal at a time</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Rescue Food.
                <br />
                <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                  Feed Lives.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-primary-100 leading-relaxed mb-8 max-w-lg">
                PlateShare connects restaurants and bakeries with surplus food to local NGOs and shelters in real time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onFindFood}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg shadow-primary-900/20 group"
                >
                  <Search size={18} />
                  Find Food Near You
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onDonateFood}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-900/20 group"
                >
                  <Heart size={18} />
                  Donate Surplus Food
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            
            </div>

            {/* Right Side - Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              {statCards.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 lg:p-6 hover:bg-white/15 transition-all duration-300 animate-fadeInUp`}
                  style={{ animationDelay: `${(i + 1) * 0.15}s`, animationFillMode: 'both' }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-primary-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path d="M0 40C360 80 720 0 1440 40V100H0V40Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How PlateShare Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Three simple steps to rescue surplus food and feed those in need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Donors Post Food',
                desc: 'Restaurants and bakeries list their surplus food with quantity, type, and pickup details.',
                gradient: 'from-primary-500 to-primary-600',
              },
              {
                step: '02',
                title: 'NGOs Browse & Request',
                desc: 'Verified NGOs and shelters browse available food and send pickup requests.',
                gradient: 'from-emerald-500 to-emerald-600',
              },
              {
                step: '03',
                title: 'Food Gets Rescued',
                desc: 'Food is picked up and delivered to those who need it most. Zero waste achieved!',
                gradient: 'from-amber-500 to-amber-600',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-xl font-bold mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose PlateShare?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Built with cutting-edge technology to make food sharing seamless
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of restaurants, bakeries, and NGOs who are already reducing food waste through PlateShare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onFindFood}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition shadow-xl text-lg"
            >
              Get Started Now
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-primary-400 to-primary-600 text-white p-2 rounded-xl">
                  <UtensilsCrossed size={20} />
                </div>
                <span className="text-xl font-bold text-white">PlateShare</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Connecting food donors with those in need. Together we can reduce food waste and feed communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onFindFood} className="hover:text-white transition">Browse Food</button></li>
                <li><button onClick={onDonateFood} className="hover:text-white transition">Donate Food</button></li>
                <li><span className="cursor-default">How It Works</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>hello@plateshare.org</li>
                <li>+91 98765 43210</li>
                <li>Kochi, Kerala, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 PlateShare. All rights reserved. Built with ❤️ to reduce food waste.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
