// components/dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value?: string | number; // Value is optional for "Quick Add"
  children?: React.ReactNode; // To allow for buttons like "Quick Add"
}

const StatCard: React.FC<StatCardProps> = ({ title, value, children }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[100px]">
      <span className="text-sm text-gray-500">{title}</span>
      {value !== undefined && (
        <span className="text-2xl font-semibold mt-1">{value}</span>
      )}
      {children}
    </div>
  );
};

export default StatCard;