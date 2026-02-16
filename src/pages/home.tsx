import { BotMessageSquare, MoveRight, NotebookText } from 'lucide-react';
import { useState } from 'react';
import registry from '../api-data/registry.json';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-size-screen col-full-center gap-3">
      <span className="flex-center bg-primary gap-5 rounded-full px-7 py-1 text-white shadow-md">
        Check out the latest docs <MoveRight size={16} />
      </span>
      <h1 className="mb-6 text-6xl font-bold">Swagster🔥</h1>
      <h2 className="text-4xl font-bold">Explore api docs like never before</h2>
      <button
        className="bg-primary! flex gap-5 rounded-none! text-white"
        onClick={() => setPanelOpen(true)}
      >
        Create Documentation <NotebookText />
      </button>

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
                    {api.description}
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
