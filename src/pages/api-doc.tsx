import { Link, useParams } from "react-router-dom";
import { Link as LincIcon } from "lucide-react";
import registry from "../api-data/registry.json";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function ApiDoc() {
  const params = useParams();
  const api = registry.apis.find((api) => api.id === params.name);

  const [apiPanelOpen, setApiPanelOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    Record<string, string>
  >({});

  const methodColorMapping: Record<string, Record<string, string>> = {
    GET: {
      bg: "bg-tropic-green",
      bgLight: "bg-tropic-green/30 hover:bg-tropic-green/60",
    },
    POST: {
      bg: "bg-tropic-blue",
      bgLight: "bg-tropic-blue/30 hover:bg-tropic-blue/60",
    },
    PUT: {
      bg: "bg-tropic-pink",
      bgLight: "bg-tropic-pink/30 hover:bg-tropic-pink/60",
    },
    DELETE: {
      bg: "bg-tropic-red",
      bgLight: "bg-tropic-re/30 hover:bg-tropic-red/60",
    },
  };

  return (
    <div className="min-h-screen ">
      <nav className="bg-black px-10 py-4 text-white justify-center col">
        <Link to={"/"} className="font-medium text-white! text-2xl">
          Swagster
        </Link>
        <span>By Steeve</span>
      </nav>
      <div>
        <div className="p-10">
          <div className="flex gap-2 mb-3">
            <h1>{api?.name}</h1>
            <p className="bg-accent border border-black/20 mt-2 shadow-sm text-primary rounded-full size-fit px-2">
              v{api?.version}
            </p>
          </div>
          <p className="mb-2 max-w-7xl">{api?.description}</p>
          <Link
            to={api?.baseUrl as string}
            target="_blank"
            className="text-black! hover:underline! hover:text-blue-500!"
          >
            {api?.baseUrl}
          </Link>
        </div>

        <div className="p-10 min-h-screen mt-3 bg-accent">
          {api?.resources.map((group) => {
            return (
              <div className="space-y-4 col">
                <a
                  href={`#${group.groupName.toLowerCase()}`}
                  id={group.groupName.toLowerCase()}
                  className="text-2xl group hover:text-primary align-center cursor gap-3"
                >
                  {group.groupName}{" "}
                  <LincIcon
                    className={`opacity-0 group-hover:opacity-100 duration-300`}
                  />
                </a>
                {group.endpoints.map((endpoint) => (
                  <div
                    className={`align-center gap-4 border-b border-primary w-fit px-4 py-3 ${methodColorMapping[endpoint.method].bgLight} duration-200 cursor`}
                    onClick={() => {
                      setApiPanelOpen(true);
                      setSelectedEndpoint({name: group.groupName, ...endpoint});
                    }}
                  >
                    <span
                      className={`rounded-full min-w-16 py-1 text-center shadow-sm ${methodColorMapping[endpoint.method].bg}`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-lg font-bold">{endpoint.path}</span>
                    <span className="text-base">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`fixed w-screen h-screen bg-black/30 inset-0 hidden ${apiPanelOpen ? "flex-center" : "hidden"}`}
        onClick={() => setApiPanelOpen(false)}
      >
        <div
          className="rounded-[15px] col bg-white min-h-3/5 min-w-4/5 max-w-5xl p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-2xl text-primary! border-b border-muted-foreground! pb-3">
            {selectedEndpoint.name}
          </p>
          <div
            className={`mt-5 grow rounded-md p-3 ${methodColorMapping[selectedEndpoint.method]?.bgLight}`}
          >
            <p className="text-black!">Method {selectedEndpoint.method}</p>
            <p>Path {selectedEndpoint.path}</p>

            <div className="mt-5">
              <p className="text-lg">Response</p>
              <p>code 200</p>
              <SyntaxHighlighter
                language="json"
                style={tomorrow}
                customStyle={{
                  background: "#333",
                  borderRadius: 8,
                  padding: 16,
                  marginTop: 8,
                }}
              >
                {JSON.stringify(selectedEndpoint.responseSample, null, 2)}
              </SyntaxHighlighter>{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
