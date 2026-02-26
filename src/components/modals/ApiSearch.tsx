import registry from '@/api-data/registry.json';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../custom/Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Kbd } from '../ui/kbd';

const apis = registry.apis.map((api) => ({
  id: api.id,
  name: api.name,
  description: api.shortDescription,
  icon: api.icon,
}));

export default function ApiSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  const [inputFocused, setInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredApis = apis.filter((api) =>
    api.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const results = inputValue ? filteredApis : apis;

  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || inputFocused) return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, inputFocused]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      containerStyles="w-2xl border-2 border-primary"
      headerContent={
        <>
          <div className="flex-between mb-1 items-center">
            <h2 className="text-primary text-lg">Select an API</h2>
            <Button
              className="flex-center size-7! rounded-full! bg-transparent! p-0! text-black"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="relative">
            <Input
              autoFocus
              ref={inputRef}
              value={inputValue}
              placeholder="Search API"
              className="focus-visible:border-primary border-primary/20 pl-9 text-base! shadow-sm focus-visible:shadow-md"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (!inputValue || filteredApis.length === 0) return;

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev < filteredApis.length - 1 ? prev + 1 : prev));
                }

                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
                }

                if (e.key === 'Enter') {
                  e.preventDefault();
                  const selected = filteredApis[activeIndex];
                  if (selected) {
                    navigate(`api/docs/${selected.id}`);
                    onClose();
                  }
                }
              }}
            />

            <Search
              size={16}
              className={`text-muted-foreground! absolute top-1/2 left-3 -translate-y-1/2 ${
                inputFocused ? 'text-primary!' : ''
              }`}
            />

            {inputValue ? (
              <Button
                className="flex-center focus-visible:text-primary absolute top-1/2 right-2 size-7! -translate-y-1/2 bg-transparent! p-0! text-black"
                onClick={() => setInputValue('')}
              >
                <X size={15} />
              </Button>
            ) : (
              <Kbd className="bg-primary/60 absolute top-1/2 right-2 -translate-y-1/2 text-white">
                /
              </Kbd>
            )}
          </div>
        </>
      }
    >
      <div className="col py-5">
        {results.map((api, index) => {
          const isActive = inputValue && filteredApis.length > 0 && index === activeIndex;

          return <ApiLink key={api.id} {...api} isActive={!!isActive} />;
        })}
      </div>
    </Modal>
  );
}

export const ApiLink = ({
  id,
  name,
  icon,
  description,
  isActive,
}: {
  id: string;
  name: string;
  icon?: string;
  description: string;
  isActive?: boolean;
}) => {
  const IconComponent = (LucideIcons as any)[icon || ''] || LucideIcons.Bot;

  return (
    <Link
      to={`api/docs/${id}`}
      className={`group align-center from-primary/5 to-primary/5 before:bg-primary/60 relative via-[#ede0fe] px-7 pt-1 pb-2 before:absolute before:top-1/2 before:h-10/12 before:w-1 before:-translate-y-1/2 before:rounded-full before:opacity-0 before:transition-opacity before:duration-200 before:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-11/12 after:-translate-x-1/2 after:bg-linear-to-r after:from-white after:via-gray-500 after:to-white hover:bg-linear-to-r hover:before:opacity-100 focus:outline-0 focus-visible:bg-linear-to-r focus-visible:before:opacity-100 ${
        isActive ? 'bg-linear-to-r before:opacity-100' : ''
      }`}
    >
      <div
        className={`flex-between w-full duration-200 group-hover:pl-5 ${isActive ? 'pl-5' : ''} group-focus-visible:pl-5`}
      >
        <div className="col">
            <p className="text-primary flex gap-2 text-base font-medium">
              {name} {IconComponent && <IconComponent size={18} className="text-primary mt-0.75" />}
            </p>
            <p className="text-gray-700">{description}</p>
        </div>

        <ChevronRight
          className={`text-primary ${
            isActive ? 'flex' : 'hidden'
          } group-hover:flex group-focus-visible:flex`}
          size={17}
        />
      </div>
    </Link>
  );
};
