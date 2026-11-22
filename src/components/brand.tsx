import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e5eadf] text-[#526a55]',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 44 44" className="hand-drawn size-8" fill="none">
        <path
          d="M13.5 25.5c2.2 4.8 8.2 7.2 13.2 4.7 4.8-2.4 6.4-8.7 3.2-13.1-3.1-4.3-9.5-4.8-13.3-.8-2.7 2.8-3.4 6.3-3.1 9.2Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M22 8V4.5M31.5 11.5l2.6-2.6M10.5 12l-2-2M34 22h3.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M15 31.5c-1.5 3.6-1.2 6.4-.4 8.5 3.7-1 6.1-3.1 7.2-6.2M14.7 36.8l4.7-2.8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M19 22.2c1.8 1.4 4 1.4 5.8 0" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </span>
  );
}
