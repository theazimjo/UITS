import React from 'react';

const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700/50';
  
  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    rect: 'h-full w-full rounded-xl',
    circle: 'rounded-full',
  };

  const style = {
    width: width ? width : undefined,
    height: height ? height : undefined,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
      style={style}
    />
  );
};

export default Skeleton;
