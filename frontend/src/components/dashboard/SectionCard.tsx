// components/dashboard/SectionCard.tsx
// (Ensure this component exists as created previously)
import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string; // Optional description
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  children,
  className = '',
  titleClassName = 'text-lg font-semibold mb-3',
}) => {
  return (
    <div className={`relative bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <h3 className={titleClassName}>{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  );
};

export default SectionCard;