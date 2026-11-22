import type { Metadata } from 'next';
import { AppHeader } from '@/components/app-header';
import { AppProvider } from '@/components/providers/app-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '小张老师｜托育照护语音交互演示',
    template: '%s｜小张老师',
  },
  description: '面向托育保育与幼儿照护比赛现场的中文语音交互演示，支持固定话术匹配、语音播报和话术管理。',
  keywords: ['托育保育', '幼儿照护', '语音交互', '比赛演示', '小张老师'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <AppProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <AppHeader />
            <main className="relative z-10">{children}</main>
            <footer className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-2 px-5 pb-7 pt-10 text-xs leading-5 text-[#718076] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
              <span>小张老师 · 托育照护语音交互演示</span>
              <span>固定话术驱动 · 不调用大模型生成回复 · 不接入传感器</span>
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
