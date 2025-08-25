'use client';
import React from 'react';

type InputProps = React.ComponentProps<'input'>;

export function Input(props: InputProps) {
  return (
    <input
      className="w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
      {...props}
    />
  );
}