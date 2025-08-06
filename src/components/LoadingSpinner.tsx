
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center absolute inset-0 bg-white bg-opacity-90 z-25">
      <div className="relative">
        <div className={`${sizeClasses} border-primary-200 border-t-accent-400 rounded-full animate-spin`}></div>
      </div>
      {text && <p className="mt-4 text-primary-600 text-sm">{text}</p>}
    </div>
  );
}