// components/dashboard/SectionCard.tsx
import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`relative bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
};

export default SectionCard;