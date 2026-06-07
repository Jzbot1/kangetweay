import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import ROUTES from '../constants/routes.js';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Decorative gradient shadows */}
      <div className="absolute w-[400px] h-[400px] bg-brand/10 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        <div className="w-16 h-16 rounded-full border border-dark-border bg-dark-surface/40 flex items-center justify-center text-gray-500 mb-2">
          <Compass className="w-8 h-8 text-brand animate-pulse" />
        </div>
        <h2 className="text-6xl font-black text-gray-200 tracking-tight">404</h2>
        <h3 className="text-xl font-bold text-gray-300">Target Route Not Found</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          The requested page is missing or has been deleted. Kindly verify the URL parameters and path routes.
        </p>
        <Link to={ROUTES.LANDING} className="mt-4">
          <Button variant="primary" size="md" className="font-semibold text-sm px-6 h-11">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
