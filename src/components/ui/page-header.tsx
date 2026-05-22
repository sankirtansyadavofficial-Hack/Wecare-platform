import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="relative pt-32 pb-20 overflow-hidden w-full bg-white/20 dark:bg-black/20 backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.05)] dark:shadow-none border-b border-gray-100/50 dark:border-white/5 text-gray-900 dark:text-white">
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIyOSwgOSwgMjAsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIyMywgMjI2LCAyMzAsIDAuMDcpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 dark:bg-white/10 text-red-600 dark:text-red-400 p-4 rounded-3xl mb-6 shadow-sm border border-red-100 dark:border-white/5 inline-flex items-center justify-center backdrop-blur-md">
          <Icon className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">{title}</h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl text-center leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
