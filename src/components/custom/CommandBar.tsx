'use client';

import registry from '@/api-data/registry.json';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import * as LucideIcons from 'lucide-react';
import { HomeIcon, Info, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kbd } from '../ui/kbd';

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        return;
      }

      if (!open) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setOpen(false);
        navigate('/');
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setOpen(false);
        navigate('/about');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, navigate]);

  const getIcon = (iconName?: string) => {
    return (LucideIcons as any)[iconName || ''] || LucideIcons.Bot;
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="hover:border-primary! hidden w-70 justify-between border-[#ffffff58]! bg-[#1f1f1f] py-4! text-start! text-xs hover:bg-[#282828] hover:text-white focus-visible:bg-[#282828] focus-visible:text-white sm:flex"
      >
        <span className="align-center gap-2">
          <Search className="mb-0.5" /> Search Documentation
        </span>
        <Kbd className="bg-[#3b3b3b] px-2 text-white">⌘ + K</Kbd>
      </Button>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="hover:border-primary! flex size-fit! rounded-full! border-[#ffffff58]! bg-[#1f1f1f] p-2.5! text-white! hover:bg-[#282828] focus-visible:bg-[#282828] sm:hidden"
      >
        <Search />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Navigate or search for an API..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem
                className="hover:bg-primary hover:text-white hover:*:text-white focus-visible:text-white focus-visible:*:text-white"
                onSelect={() => {
                  setOpen(false);
                  navigate('/');
                }}
              >
                <HomeIcon />
                <span>Home</span>
                <CommandShortcut className='flex'>
                  ⌘<b className="w-4! text-center">H</b>
                </CommandShortcut>
              </CommandItem>
              <CommandItem
                className="hover:bg-primary hover:text-white hover:*:text-white focus-visible:text-white focus-visible:*:text-white"
                onSelect={() => {
                  setOpen(false);
                  navigate('/about');
                }}
              >
                <Info />
                <span>About</span>
                <CommandShortcut className='flex'>
                  ⌘<b className="w-4! text-center">I</b>
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="APIs">
              {registry.apis.map((api) => {
                const Icon = getIcon(api.icon);

                return (
                  <CommandItem
                    key={api.id}
                    className="..."
                    onSelect={() => {
                      setOpen(false);
                      navigate(`/api/docs/${api.id}`);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{api.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
