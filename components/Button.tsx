'use client';
import React from 'react';

type ButtonProps = React.ComponentProps<'button'>;

export function Button(props: ButtonProps) {
  return (
    <button
      className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
}