import { BotMessageSquare, MoveRight, NotebookText } from "lucide-react"
import { useState } from "react"
import registry from "../api-data/registry.json"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false)
  const navigate = useNavigate();

  return (
    <div className="min-size-screen col-full-center gap-3">
      <span className=" rounded-full px-7 py-1 flex-center gap-5 shadow-md bg-primary text-white">Check out the latest docs <MoveRight size={16}/></span>
      <h1 className="text-6xl font-bold mb-6">Swagster🔥</h1>
      <h2 className="text-4xl font-bold">Explore api docs like never before</h2>
      <button className="bg-primary! text-white flex gap-5 rounded-none!" onClick={() => setPanelOpen(true) }>Create Documentation <NotebookText /></button>

      <div className={`absolute size-screen bg-black/30 ${panelOpen ? "flex-center" : "hidden"}`} onClick={() => setPanelOpen(false)}>
        <div className="size-3/5 max-w-5xl max-h-200 p-5 bg-white rounded-[15px]" onClick={(e) => e.stopPropagation()}>
        <p className="text-3xl font-medium align-center gap-4 text-primary">Available APIs <BotMessageSquare size={35} /></p>
        <div className="mt-5 flex flex-wrap gap-2">
          {
            registry.apis.map(api => {
              return <button onClick={() => navigate(`/api/docs/${api.id}`)} className="border border-primary! shadow-md bg-white! text-black text-start hover:bg-primary! hover:text-white hover:shadow-md hover:border-primary! duration-300 group">
                <p className="text-lg font-medium">{api.name}</p>
                <p className="text-muted-foreground group-hover:text-white/80">{api.description}</p>
              </button>
            })
          }
        </div>
        </div>
      </div>
    </div>
  )
}
