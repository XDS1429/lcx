'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, House } from 'lucide-react';
import { BrandMark } from '@/components/brand';
import { SettingsPanel } from '@/components/settings-panel';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/', label: '语音演示', icon: House },
  { href: '/scenarios', label: '话术管理', icon: BookOpenText },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-30 border-b border-[#e8e1d4]/80 bg-[#fbf8f1]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-3 px-4 py-3 sm:h-[88px] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0 lg:px-10 2xl:px-12">
        <Link href="/" className="group flex min-h-11 items-center gap-3 self-start rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e957b]">
          <BrandMark className="size-12 transition-transform duration-300 group-hover:-rotate-3" />
          <span>
            <span className="brand-title block text-[21px] font-bold leading-7">小张老师</span>
            <span className="hidden text-base font-medium tracking-[0.12em] text-[#5f6d63] md:block">托育照护语音交互演示</span>
          </span>
        </Link>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <nav className="grid flex-1 grid-cols-2 items-center gap-1 rounded-full border border-[#e5ded1] bg-[#fffefa] p-1 sm:flex sm:flex-none" aria-label="主导航">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-full px-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e957b] sm:px-5 sm:text-base',
                    active ? 'bg-[#526a55] text-white shadow-sm' : 'text-[#526158] hover:bg-[#edf0e7] hover:text-[#425a49]',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <SettingsPanel />
        </div>
      </div>
    </header>
  );
}
