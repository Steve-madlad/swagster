import FormBuilder from '@/components/form/FormBuilder';
import { executeHttpRequest, type RequestProps } from '@/lib/axios';
import {
  Computer,
  Copy,
  Link as LincIcon,
  Loader2,
  MoveLeft,
  SendHorizontal,
  Server,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from 'sonner';
import registry from '../api-data/registry.json';
import { Button } from '../components/ui/button';

export default function ApiDoc() {
  const params = useParams();
  const api = registry.apis.find((api) => api.id === params.name);

  const [apiPanelOpen, setApiPanelOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Record<string, any>>({});

  const [showSecondPanel, setShowSecondPanel] = useState(false);
  const [executionLoading, setExecutionLoading] = useState(false);

  type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  const methodColorMap = {
    GET: {
      solid: 'bg-tropic-green',
      light: 'bg-tropic-green/30',
      hoverLight: 'hover:bg-tropic-green/60 focus-visible:bg-tropic-green/60',
    },
    POST: {
      solid: 'bg-tropic-blue',
      light: 'bg-tropic-blue/30',
      hoverLight: 'hover:bg-tropic-blue/60 focus-visible:bg-tropic-blue/60',
    },
    PUT: {
      solid: 'bg-tropic-pink',
      light: 'bg-tropic-pink/30',
      hoverLight: 'hover:bg-tropic-pink/60 focus-visible:bg-tropic-pink/60',
    },
    PATCH: {
      solid: 'bg-tropic-yellow',
      light: 'bg-tropic-yellow/30',
      hoverLight: 'hover:bg-tropic-yellow/60 focus-visible:bg-tropic-yellow/60',
    },
    DELETE: {
      solid: 'bg-tropic-red',
      light: 'bg-tropic-red/30',
      hoverLight: 'hover:bg-tropic-red/60 focus-visible:bg-tropic-red/60',
    },
  } as const;

  const modalMethodColorMap = {
    GET: 'bg-[#10b981]',
    POST: 'bg-tropic-blue',
    PUT: 'bg-tropic-pink',
    PATCH: 'bg-tropic-yellow',
    DELETE: 'bg-tropic-red',
  };

  function getMethodClasses(
    method: HttpMethod,
    options?: {
      variant?: 'solid' | 'light';
      hover?: boolean;
    },
  ) {
    const styles = methodColorMap?.[method];
    const variant = options?.variant ?? 'solid';
    const hover = options?.hover ?? false;

    if (variant === 'solid') return styles.solid;

    return `${styles?.light} ${hover ? styles.hoverLight : ''}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.success('Failed to copy');
      console.error('Failed to copy:', err);
    }
  }

  async function submitRequest(vals: Record<string, string | number>) {
    const props: RequestProps = {
      url: api?.baseUrl + selectedEndpoint.path,
      method: selectedEndpoint.method,
      body: vals,
    };

    await executeHttpRequest(props);
  }

  return (
    <div className="min-h-screen ">
      <nav className="bg-black px-10 py-4 text-white justify-center col">
        <Link to={'/'} className="font-medium text-white! text-2xl">
          Swagster
        </Link>
        <span>By Steeve</span>
      </nav>
      <div>
        <div className="p-10">
          <div className="flex gap-2 mb-3">
            <h1>{api?.name}</h1>
            <p className="bg-accent border border-black/20 mt-2 text-primary rounded-full size-fit px-2">
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
              <div className="space-y-5">
                <a
                  href={`#${group.groupName.toLowerCase()}`}
                  id={group.groupName.toLowerCase()}
                  className="text-2xl group hover:text-primary align-center cursor gap-3"
                >
                  {group.groupName}
                  <LincIcon className={`opacity-0 group-hover:opacity-100 duration-300`} />
                </a>
                <div className="col w-fit space-y-4 col">
                  {group.endpoints.map((endpoint: Record<string, any>) => (
                    <button
                      className={`
                        relative flex-between gap-4 px-4 py-3 cursor sm:min-w-2xl
                        ${getMethodClasses(endpoint.method, { variant: 'light', hover: true })}
                        after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5
                        after:bg-primary after:transition-all after:duration-200 hover:after:h-1 focus-visible:after:h-1
                        `}
                      tabIndex={0}
                      onClick={() => {
                        setApiPanelOpen(true);
                        setSelectedEndpoint({
                          name: group.groupName,
                          ...endpoint,
                        });
                      }}
                    >
                      <div className="align-center gap-4">
                        <span
                          className={`min-w-16 rounded-full py-1 text-center shadow-sm ${getMethodClasses(endpoint.method)}`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="text-lg font-bold">{endpoint.path}</span>
                        <span className="text-base">{endpoint.description}</span>
                      </div>

                      {endpoint.authenticated && (
                        <ShieldCheck className="fill-tropic-blue text-black/70" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`fixed h-screen w-screen bg-black/30 inset-0 hidden ${apiPanelOpen ? 'flex-center' : 'hidden'}`}
        onClick={() => setApiPanelOpen(false)}
      >
        <div
          className="rounded-md overflow-hidden col bg-white min-h-3/5 min-w-4/5 max-h-176 max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="align-center gap-3 border-b-3 border-gray-200 py-4 px-7">
            <div className="bg-primary/15 text-primary flex-center rounded-lg p-2">
              <Computer size={35} />
            </div>
            <div>
              <h2 className="text-primary text-2xl font-semibold">
                {selectedEndpoint.name} Endpoint
              </h2>
              <div className="flex text-muted-foreground">
                <p>{api?.name}</p>•<p>V{api?.version}</p>
              </div>
            </div>
          </div>

          <div className="flex grow">
            <div className="flex-1 max-h-[calc(44rem-90.13px)] overflow-hidden relative">
              <div
                className={`flex h-full transition-transform duration-500 ease-in-out ${
                  showSecondPanel ? '-translate-x-full' : 'translate-x-0'
                }`}
              >
                <div className="w-full shrink-0 overflow-y-auto">
                  <div className="space-y-6 col p-7 min-h-full">
                    <div>
                      <p className="text-xl">Resouce Path</p>
                      <div className="bg-muted border mt-2 border-gray-200 flex-between text-black px-4 py-3 rounded-xl">
                        <div className="flex gap-6">
                          <div
                            className={`px-3 py-1 w-fit text-white! rounded-lg ${modalMethodColorMap[selectedEndpoint.method as HttpMethod]}`}
                          >
                            {selectedEndpoint.method}
                          </div>
                          <p className="align-center gap-2 text-lg">{selectedEndpoint.path}</p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(selectedEndpoint.path)}
                          size={'icon-xl'}
                          className="border-gray-400! text-primary bg-white! hover:bg-white/20! p-5!"
                        >
                          <Copy />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xl">Description</p>
                      <p className="text-muted-foreground">{selectedEndpoint.description}</p>
                      <div className="flex gap-4 mt-2">
                        <div className="bg-muted border border-gray-200 flex-1 col gap-1  text-black px-4 py-3 rounded-xl mt-1">
                          <p className="align-center gap-4 text-primary text-lg">
                            <ShieldCheck /> Authentication
                          </p>
                          <p className="pl-10">Required (Bearer Token)</p>
                        </div>
                        <div className="bg-muted border border-gray-200 flex-1 col gap-1  text-black px-4 py-3 rounded-xl mt-1">
                          <p className="align-center gap-4 text-primary text-lg">
                            <Server size={19} /> Rate Limit
                          </p>
                          <p className="pl-10">100req/min</p>
                        </div>
                      </div>
                    </div>
                    {selectedEndpoint.method !== 'GET' && (
                      <div>
                        <p className="text-xl">Path Parameters</p>
                        <div className="mt-2 border border-slate-200 rounded-sm overflow-x-auto overflow-y-hidden">
                          <table className="w-full ">
                            <thead className="bg-muted">
                              <tr className="text-primary">
                                <td className="px-4 py-2">Name</td>
                                <td className="px-4 py-2">Type</td>
                                <td className="px-4 py-2">Required</td>
                                <td className="px-4 py-2">Description</td>
                                {selectedEndpoint?.request?.body?.find(
                                  (field: Record<string, any>) => field.enum !== undefined,
                                ) && (
                                  <td className="px-4 py-2 border-r border-slate-200 ">Options</td>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedEndpoint?.request?.body?.map(
                                (field: Record<string, any>) => (
                                  <tr>
                                    <td className="px-4 py-2 border-r border-slate-200 ">
                                      {field.name}
                                    </td>
                                    <td className="px-4 py-2 border-r border-slate-200 ">
                                      {field.type}
                                    </td>
                                    <td className="px-4 py-2 text-center border-r border-slate-200 ">
                                      {field.required ? 'yes' : 'no'}
                                    </td>
                                    <td className="px-4 py-2 border-r border-slate-200 ">
                                      {field.description}
                                    </td>
                                    {field.enum && (
                                      <td className="px-4 py-2 border-r border-slate-200 ">
                                        {field.enum.join(', ')}
                                      </td>
                                    )}
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <Button
                      size={'icon-xl'}
                      onClick={() => setShowSecondPanel(true)}
                      className="bg-primary! border-3! mt-auto border-transparent hover:bg-white! hover:border-primary! hover:text-primary duration-300 flex gap-3 text-white text-xl! py-6! font-semibold w-full"
                    >
                      Send Request <SendHorizontal />
                    </Button>
                  </div>
                </div>

                <div className="w-full col shrink-0 bg-muted overflow-y-auto p-7">
                  <Button
                    size={'icon-xl'}
                    className="bg-transparent! flex gap-2 text-base text-black pl-0! mb-4 w-fit hover:gap-3 duration-300"
                    onClick={() => setShowSecondPanel(false)}
                  >
                    <MoveLeft /> Back
                  </Button>

                  {selectedEndpoint?.request?.body && (
                    <FormBuilder
                      formConfig={selectedEndpoint.request.body}
                      onSubmit={(vals) => submitRequest(vals)}
                      isLoading={setExecutionLoading}
                    />
                  )}
                </div>
              </div>
            </div>

            <div
              className={`flex-1 py-7 bg-[#0f172a] max-h-[calc(44rem-90.13px)] max-w-1/2 ${executionLoading && 'col-full-center'}`}
            >
              {!executionLoading && (
                <div className="flex-between px-7">
                  <p className="border-b-4 border-primary text-white w-fit text-xl font-semibold">
                    Response Example
                  </p>
                  <div className="flex gap-3">
                    <div className="rounded-full flex gap-3 align-center w-fit bg-[#10b981]/40  text-white! px-3">
                      <div className="size-2 rounded-full bg-[#10b981] animate-pulse"></div>
                      200 OK
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(selectedEndpoint.responseSample, null, 2))
                      }
                      size={'icon-lg'}
                      className="border-gray-400! text-primary bg-white! hover:bg-white/60! p-2!"
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
              )}

              <div className={`rounded-md ${executionLoading && 'bg-transparent flex-center'}`}>
                {executionLoading ? (
                  <Loader2 size={35} className="animate-spin text-primary!" />
                ) : (
                  <SyntaxHighlighter
                    language="json"
                    style={nightOwl}
                    customStyle={{
                      background: '#0a101d',
                      borderRadius: 8,
                      padding: '1rem 2.75rem ',
                      marginTop: '1rem',
                      overflow: 'auto',
                      maxHeight: 'calc(44rem - 184.13px)',
                      colorScheme: 'dark',
                    }}
                  >
                    {JSON.stringify(selectedEndpoint.responseSample, null, 2)}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
