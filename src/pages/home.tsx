import GithubStarButton from '@/components/GithubStarButton';
import ApiSearch from '@/components/modals/ApiSearch';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';
import { MoveRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="min-size-screen col-full-center gap-3">
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden rounded-lg p-20">
        <AnimatedGridPattern
          numSquares={40}
          maxOpacity={0.5}
          duration={6}
          repeatDelay={3}
          className={cn(
            'mask-[radial-gradient(900px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12',
          )}
        />
      </div>

      <div className="col-center absolute z-0 px-5">
        <img src="/logo.png" width={97.5} className="bobbing-animation mb-3" alt="swagster logo" />
        <span
          key="latest-docs"
          className="flex-center from-primary w-fit gap-3 rounded-full bg-linear-to-r to-violet-400 px-7 py-1 text-xs text-white shadow-md"
        >
          Discover What's New <Sparkles size={14} />
        </span>
        <h1
          key="swagster-title"
          className="from-primary to-primary mt-6 mb-3 bg-linear-to-r via-indigo-400 bg-clip-text pb-2.5 text-center text-7xl! font-semibold text-transparent lg:mt-0 lg:mb-4 lg:text-8xl!"
        >
          Swagster Docs
        </h1>
        <h2
          key="swagster-subtitle"
          className="from-primary to-primary gap-4 bg-linear-to-r via-indigo-400 bg-clip-text text-center text-2xl font-medium text-transparent"
        >
          Explore api docs like never before
        </h2>
        <div className="flex gap-4">
          <button
            key="create-docs-btn"
            className="from-primary group hover:animate-gradient hover:animate-glow bg-size[200%_200%] align-center mt-10 gap-1 rounded-full! bg-linear-to-r via-indigo-500 to-violet-400 bg-left px-10 py-4 text-white transition-all! duration-100! hover:scale-105 hover:gap-4 focus:outline-none focus-visible:gap-4"
            onClick={() => setPanelOpen(true)}
          >
            View Collection
            <MoveRight
              className="w-0 overflow-hidden duration-200 group-hover:w-5 group-focus-visible:w-5"
              size={20}
            />
          </button>

          <GithubStarButton />
        </div>
      </div>

      <ApiSearch open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
