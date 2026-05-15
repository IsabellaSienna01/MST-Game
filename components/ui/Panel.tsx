import { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`px-3 py-3 border-b border-gray-700 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[2px] mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}
