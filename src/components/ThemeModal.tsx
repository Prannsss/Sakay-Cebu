'use client';

import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeModal({ open, onOpenChange }: ThemeModalProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  ];

  const handleThemeSelect = (value: string) => {
    setTheme(value);
    setTimeout(() => onOpenChange(false), 200);
  };

  // Use Sheet for mobile, Dialog for desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Choose Theme</SheetTitle>
          </SheetHeader>
          <div className="grid gap-3 pt-6 pb-4">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;
              
              return (
                <Button
                  key={themeOption.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="h-auto p-4 justify-start"
                  onClick={() => handleThemeSelect(themeOption.value)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{themeOption.label}</div>
                      <div className="text-xs opacity-80">{themeOption.description}</div>
                    </div>
                    {isSelected && <Check className="h-5 w-5" />}
                  </div>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 pt-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <Button
                key={themeOption.value}
                variant={isSelected ? 'default' : 'outline'}
                className="h-auto p-4 justify-start"
                onClick={() => handleThemeSelect(themeOption.value)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{themeOption.label}</div>
                    <div className="text-xs opacity-80">{themeOption.description}</div>
                  </div>
                  {isSelected && <Check className="h-5 w-5" />}
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
