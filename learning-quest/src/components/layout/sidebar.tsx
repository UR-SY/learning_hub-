"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  NotebookPen, 
  GitMerge, 
  User 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Quests', href: '/quests', icon: CheckSquare },
  { name: 'Tracker', href: '/tracker', icon: Calendar },
  { name: 'Notes', href: '/notes', icon: NotebookPen },
  { name: 'Skill Tree', href: '/skill-tree', icon: GitMerge },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col p-4">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Learning Quest</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t px-4 text-xs text-muted-foreground text-center">
        Offline First
      </div>
    </aside>
  );
}
