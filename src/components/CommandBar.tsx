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
import { Bot, HomeIcon, Info, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kbd } from './ui/kbd';

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

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="hover:border-primary! hidden sm:flex w-70 justify-between border-[#ffffff58]! bg-[#1f1f1f] py-4! text-start! text-xs hover:bg-[#282828] hover:text-white focus-visible:bg-[#282828] focus-visible:text-white"
      >
        <span className="align-center gap-2">
          <Search className="mb-0.5" /> Search Documentation
        </span>
        <Kbd className="bg-[#3b3b3b] px-2 text-white">⌘ + K</Kbd>
      </Button>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="hover:border-primary! flex sm:hidden text-white!  rounded-full! border-[#ffffff58]! bg-[#1f1f1f] p-2.5! size-fit! hover:bg-[#282828] focus-visible:bg-[#282828]"
      >
        <Search/>
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
                <CommandShortcut>⌘H</CommandShortcut>
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
                <CommandShortcut>⌘I</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="APIs">
              {registry.apis.map((api) => (
                <CommandItem
                  className="hover:bg-primary hover:text-white hover:*:text-white focus-visible:text-white focus-visible:*:text-white"
                  key={api.id}
                  onSelect={() => {
                    setOpen(false);
                    navigate(`/api/docs/${api.id}`);
                  }}
                >
                  <Bot />
                  {api.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
