'use client';

const LoadingSpinner = () => {
  return (
    <div className="w-full h-full fixed top-0 left-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ZekPurple"></div>
    </div>
  );
};

export default LoadingSpinner;