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
    <header className="relative z-30 border-b border-[#e8e1d4]/80 bg-[#fbf8f1]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e957b]">
          <BrandMark className="transition-transform duration-300 group-hover:-rotate-3" />
          <span>
            <span className="brand-title block text-[19px] font-bold leading-6">小张老师</span>
            <span className="hidden text-[11px] tracking-[0.14em] text-[#718076] sm:block">托育照护语音交互演示</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-1 rounded-full border border-[#e5ded1] bg-[#fffefa] p-1" aria-label="主导航">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e957b] sm:px-4',
                    active ? 'bg-[#526a55] text-white shadow-sm' : 'text-[#68766b] hover:bg-[#edf0e7] hover:text-[#425a49]',
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
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
