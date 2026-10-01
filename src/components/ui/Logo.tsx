import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSize = size === 'sm' ? 'w-6 h-6 text-sm' : size === 'lg' ? 'w-10 h-10 text-xl' : 'w-8 h-8 text-base';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Icon mark */}
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/25 ring-1 ring-white/20`}
      >
        <span className="tracking-tighter">A+</span>
      </div>
      <div>
        <div className="flex items-center tracking-tight font-extrabold font-['Plus_Jakarta_Sans']">
          <span className={`${textSize} text-slate-900 dark:text-white`}>APROVA</span>
          <span className={`${textSize} text-emerald-500 font-black`}>+</span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Plataforma de Alta Performance
          </p>
        )}
      </div>
    </div>
  );
};
