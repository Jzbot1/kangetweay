import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Terminal,
  Activity,
  ArrowRight,
  Check,
  Layers,
  Database,
  Lock
} from 'lucide-react';
import ROUTES from '../constants/routes.js';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.js';

export const Landing: React.FC = () => {
  const [terminalText, setTerminalText] = useState('curl -X POST https://jzpay.shop/v1/order/create \\');
  const [terminalStep, setTerminalStep] = useState(0);

  // Simple typing simulation in the terminal mockup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (terminalStep === 0) {
        setTerminalText('curl -X POST https://jzpay.shop/v1/order/create \\\n  -H "X-API-Key: mg_live_6872fa13" \\\n  -d \'{"product_id": "215570", "quantity": 1}\'');
        setTerminalStep(1);
      } else if (terminalStep === 1) {
        setTerminalStep(2);
      } else {
        // Reset loop
        setTimeout(() => {
          setTerminalText('curl -X POST https://jzpay.shop/v1/order/create \\');
          setTerminalStep(0);
        }, 8000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [terminalStep]);

  const features = [
    {
      title: "Multi-Account Manager",
      desc: "Connect multiple distributor accounts under single platform credentials, split traffic, and isolate credentials.",
      icon: Layers
    },
    {
      title: "Secure Encrypted Vault",
      desc: "Your credentials are safe. Secret keys are encrypted with industrial AES-256-GCM. We never store raw keys.",
      icon: Lock
    },
    {
      title: "Real-Time Tracking",
      desc: "Monitor transaction status, track latencies, aggregate hourly metrics, and inspect direct JSON logs in real-time.",
      icon: Activity
    }
  ];

  const steps = [
    { title: "1. Create Account", desc: "Sign up on jzpay in just 10 seconds." },
    { title: "2. Add API Provider Key", desc: "Store your API Provider Partner ID and Secret Key in your vault." },
    { title: "3. Copy Gateway Key", desc: "Generate a platform API Key to authenticate requests." },
    { title: "4. Integrate & Track", desc: "Send orders through our proxy and track webhooks." }
  ];

  const pricing = [
    { name: "Free Tier", price: "$0", desc: "Perfect for testing and small integrations.", features: ["1 Active API Key", "500 Requests/day", "Basic usage analytics", "Email support"] },
    { name: "Pro Tier", price: "$49", desc: "For scaling platforms and commercial sites.", features: ["10 Active API Keys", "50,000 Requests/day", "Real-time usage graphs", "Webhooks & Delivery retries", "UAT & Production environments", "Priority Uptime SLA"], popular: true },
    { name: "Enterprise", price: "Custom", desc: "High volume processing infrastructure.", features: ["Unlimited API Keys", "Unlimited Requests/day", "Dedicated server container", "Custom SLA & Uptime contracts", "Dedicated account manager", "24/7 Phone support"] }
  ];

  return (
    <div className="bg-[#0a0a0f] text-gray-100 min-h-screen overflow-x-hidden flex flex-col select-text selection:bg-brand selection:text-white">
      {/* Navbar */}
      <nav className="h-20 border-b border-dark-border/40 max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center">
            <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-wider text-gradient">jzpay</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-gray-200 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-200 transition-colors">Quickstart</a>
          <a href="#pricing" className="hover:text-gray-200 transition-colors">Pricing</a>
          <Link to={ROUTES.DOCS} className="hover:text-gray-200 transition-colors">API Docs</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors">Login</Link>
          <Link to={ROUTES.REGISTER} className="h-10 px-4 bg-brand hover:bg-brand-600 font-semibold text-sm rounded-btn text-white transition-all shadow-lg shadow-brand/20 flex items-center">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold w-max">
            <span>✨ Introducing v1.0 API Gateway Console</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Your Gateway API.<br />
            <span className="text-gradient">Everywhere.</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg">
            A premium full-stack API Gateway for game and eVoucher top-ups. Bridge your systems securely, handle asynchronous queues with BullMQ, queue delivery webhooks, and track metrics.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link to={ROUTES.REGISTER} className="h-12 px-6 bg-brand hover:bg-brand-600 font-semibold text-base rounded-btn text-white transition-all shadow-xl shadow-brand/25 flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to={ROUTES.DOCS} className="h-12 px-6 bg-dark-surface hover:bg-dark-surface/80 border border-dark-border font-semibold text-base rounded-btn text-gray-300 transition-all flex items-center">
              View Documentation
            </Link>
          </div>
        </div>

        {/* Animated Terminal Mockup */}
        <div className="w-full relative max-w-xl mx-auto">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-brand/10 blur-[80px] rounded-full" />
          
          <div className="relative border border-dark-border/80 bg-[#0d0d12]/95 shadow-2xl rounded-card overflow-hidden">
            {/* Toolbar */}
            <div className="h-11 bg-dark-surface/40 border-b border-dark-border/60 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                Terminal
              </div>
              <div className="w-12" />
            </div>

            {/* Terminal Body */}
            <div className="p-5 font-mono text-xs md:text-sm text-left min-h-[200px] flex flex-col justify-between">
              <pre className="text-indigo-400 leading-relaxed whitespace-pre-wrap">
                <code>{terminalText}</code>
              </pre>

              {terminalStep >= 1 && (
                <div className="border-t border-dark-border/60 pt-4 mt-4 select-text">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Response 202 Accepted</p>
                  <pre className="text-emerald-400">
{`{
  "jobId": "job_948271a",
  "orderId": "c9281a94-82a1-432d-9b51-78facb21",
  "status": "queued"
}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-dark-border/30 bg-dark-surface/10 py-24">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-brand font-bold text-xs uppercase tracking-widest">Aesthetic & Powerful</span>
            <h3 className="text-3xl font-extrabold tracking-tight md:text-4xl text-gray-200">
              Complete Infrastructure Built to Scale
            </h3>
            <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">
              We provide the core tools, queues, logging, and security measures to hook directly into game networks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="p-8 rounded-card border border-dark-border bg-dark-surface/30 hover:border-brand/40 transition-all text-left flex flex-col gap-4 shadow-xl">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-200">{feat.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto w-full px-6">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <span className="text-brand font-bold text-xs uppercase tracking-widest">Simple Integration</span>
          <h3 className="text-3xl font-extrabold tracking-tight md:text-4xl text-gray-200">
            From Register to First Order in 5 Steps
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col gap-2.5 text-left p-6 rounded-card border border-dark-border bg-dark-surface/10">
              <h4 className="font-bold text-brand text-sm tracking-wide">{step.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="border-t border-dark-border/30 bg-dark-surface/10 py-24">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-brand font-bold text-xs uppercase tracking-widest">Plans</span>
            <h3 className="text-3xl font-extrabold tracking-tight md:text-4xl text-gray-200">
              Transparent, Scale-Friendly Pricing
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "p-8 rounded-card border bg-dark-surface/30 flex flex-col gap-6 text-left relative",
                  {
                    "border-brand ring-1 ring-brand bg-brand/5 shadow-2xl shadow-brand/10": tier.popular,
                    "border-dark-border": !tier.popular
                  }
                )}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                    Popular
                  </span>
                )}
                <div>
                  <h4 className="text-lg font-bold text-gray-200">{tier.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{tier.desc}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-200">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-sm text-gray-500">/month</span>}
                </div>

                <Link
                  to={ROUTES.REGISTER}
                  className={cn(
                    "h-10 w-full rounded-btn font-semibold text-sm flex items-center justify-center transition-all",
                    {
                      "bg-brand hover:bg-brand-600 text-white shadow-lg shadow-brand/25": tier.popular,
                      "bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-gray-300": !tier.popular
                    }
                  )}
                >
                  Start Plan
                </Link>

                <ul className="flex flex-col gap-3 pt-4 border-t border-dark-border/40 text-sm text-gray-400">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border/40 py-12 bg-dark-bg text-gray-600 text-xs">
        <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
            </div>
            <span className="font-bold text-sm text-gray-400">jzpay</span>
          </div>
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} jzpay platform. All rights reserved. Built for API distribution.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
