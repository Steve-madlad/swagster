import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';
import { BotMessageSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import registry from '../api-data/registry.json';

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-size-screen col-full-center gap-3">
      <div className="relative flex h-200 w-screen items-center justify-center overflow-hidden rounded-lg p-20">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            'mask-[radial-gradient(1400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12',
          )}
        />
      </div>
      <div className="col-center absolute z-0 px-5">
        <img src="/logo.png" width={130} className="bobbing-animation mb-3" alt="swagster logo" />
        <span
          key="latest-docs"
          className="flex-center from-primary w-fit gap-3 rounded-full bg-linear-to-r to-violet-400 px-7 py-1 text-white shadow-md"
        >
          Discover What's New <Sparkles size={16} />
        </span>
        <h1
          key="swagster-title"
          className="from-primary to-primary mt-6 mb-3 bg-linear-to-r via-indigo-400 bg-clip-text pb-2.5 text-center text-7xl! font-semibold text-transparent lg:mt-0 lg:mb-6 lg:text-9xl!"
        >
          Swagster Docs
        </h1>
        <h2
          key="swagster-subtitle"
          className="from-primary to-primary gap-4 bg-linear-to-r via-indigo-400 bg-clip-text text-center text-3xl font-medium text-transparent"
        >
          Explore api docs like never before
        </h2>
        <button
          key="create-docs-btn"
          className="from-primary hover:animate-gradient hover:animate-glow mt-10 flex gap-5 rounded-full! bg-gradient-to-r via-indigo-500 to-violet-400 bg-[length:200%_200%] bg-left px-10 py-4 text-xl text-white transition-transform duration-300 hover:scale-105 focus:outline-none"
          onClick={() => setPanelOpen(true)}
        >
          View Collection
        </button>
      </div>

      <div
        className={`size-screen absolute bg-black/30 ${panelOpen ? 'flex-center' : 'hidden'}`}
        onClick={() => setPanelOpen(false)}
      >
        <div
          className="size-3/5 max-h-200 max-w-5xl rounded-[15px] bg-white p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="align-center text-primary gap-4 text-3xl font-medium">
            Available APIs <BotMessageSquare size={35} />
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {registry.apis.map((api) => {
              return (
                <button
                  onClick={() => navigate(`/api/docs/${api.id}`)}
                  className="border-primary! hover:bg-primary! hover:border-primary! group border bg-white! text-start text-black shadow-md duration-300 hover:text-white hover:shadow-md"
                >
                  <p className="text-lg font-medium">{api.name}</p>
                  <p className="text-muted-foreground group-hover:text-white/80">
                    {api.shortDescription}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
