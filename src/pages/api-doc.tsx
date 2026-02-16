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
  ShieldCheck,
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
    <div className="min-h-screen">
      <nav className="col justify-center bg-black px-10 py-4 text-white">
        <Link to={'/'} className="text-2xl font-medium text-white!">
          Swagster
        </Link>
        <span>By Steeve</span>
      </nav>
      <div>
        <div className="p-10">
          <div className="mb-3 flex gap-2">
            <h1>{api?.name}</h1>
            <p className="bg-accent text-primary mt-2 size-fit rounded-full border border-black/20 px-2">
              v{api?.version}
            </p>
          </div>
          <p className="mb-2 max-w-7xl">{api?.description}</p>
          <Link
            to={api?.baseUrl as string}
            target="_blank"
            className="text-black! hover:text-blue-500! hover:underline!"
          >
            {api?.baseUrl}
          </Link>
        </div>

        <div className="bg-accent mt-3 min-h-screen p-10">
          {api?.resources.map((group) => {
            return (
              <div className="space-y-5">
                <a
                  href={`#${group.groupName.toLowerCase()}`}
                  id={group.groupName.toLowerCase()}
                  className="group hover:text-primary align-center cursor gap-3 text-2xl"
                >
                  {group.groupName}
                  <LincIcon className={`opacity-0 duration-300 group-hover:opacity-100`} />
                </a>
                <div className="col col w-fit space-y-4">
                  {group.endpoints.map((endpoint: Record<string, any>) => (
                    <button
                      className={`flex-between cursor relative gap-4 px-4 py-3 sm:min-w-2xl ${getMethodClasses(endpoint.method, { variant: 'light', hover: true })} after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:transition-all after:duration-200 after:content-[''] hover:after:h-1 focus-visible:after:h-1`}
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
        className={`fixed inset-0 hidden h-screen w-screen bg-black/30 ${apiPanelOpen ? 'flex-center' : 'hidden'}`}
        onClick={() => setApiPanelOpen(false)}
      >
        <div
          className="col max-h-176 min-h-3/5 max-w-5xl min-w-4/5 overflow-hidden rounded-md bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="align-center gap-3 border-b-3 border-gray-200 px-7 py-4">
            <div className="bg-primary/15 text-primary flex-center rounded-lg p-2">
              <Computer size={35} />
            </div>
            <div>
              <h2 className="text-primary text-2xl font-semibold">
                {selectedEndpoint.name} Endpoint
              </h2>
              <div className="text-muted-foreground flex">
                <p>{api?.name}</p>•<p>V{api?.version}</p>
              </div>
            </div>
          </div>

          <div className="flex grow">
            <div className="relative max-h-[calc(44rem-90.13px)] flex-1 overflow-hidden">
              <div
                className={`flex h-full transition-transform duration-500 ease-in-out ${
                  showSecondPanel ? '-translate-x-full' : 'translate-x-0'
                }`}
              >
                <div className="w-full shrink-0 overflow-y-auto">
                  <div className="col min-h-full space-y-6 p-7">
                    <div>
                      <p className="text-xl">Resouce Path</p>
                      <div className="bg-muted flex-between mt-2 rounded-xl border border-gray-200 px-4 py-3 text-black">
                        <div className="flex gap-6">
                          <div
                            className={`w-fit rounded-lg px-3 py-1 text-white! ${modalMethodColorMap[selectedEndpoint.method as HttpMethod]}`}
                          >
                            {selectedEndpoint.method}
                          </div>
                          <p className="align-center gap-2 text-lg">{selectedEndpoint.path}</p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(selectedEndpoint.path)}
                          size={'icon-xl'}
                          className="text-primary border-gray-400! bg-white! p-5! hover:bg-white/20!"
                        >
                          <Copy />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xl">Description</p>
                      <p className="text-muted-foreground">{selectedEndpoint.description}</p>
                      <div className="mt-2 flex gap-4">
                        <div className="bg-muted col mt-1 flex-1 gap-1 rounded-xl border border-gray-200 px-4 py-3 text-black">
                          <p className="align-center text-primary gap-4 text-lg">
                            <ShieldCheck /> Authentication
                          </p>
                          <p className="pl-10">Required (Bearer Token)</p>
                        </div>
                        <div className="bg-muted col mt-1 flex-1 gap-1 rounded-xl border border-gray-200 px-4 py-3 text-black">
                          <p className="align-center text-primary gap-4 text-lg">
                            <Server size={19} /> Rate Limit
                          </p>
                          <p className="pl-10">100req/min</p>
                        </div>
                      </div>
                    </div>
                    {selectedEndpoint.method !== 'GET' && (
                      <div>
                        <p className="text-xl">Path Parameters</p>
                        <div className="mt-2 overflow-x-auto overflow-y-hidden rounded-sm border border-slate-200">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr className="text-primary">
                                <td className="px-4 py-2">Name</td>
                                <td className="px-4 py-2">Type</td>
                                <td className="px-4 py-2">Required</td>
                                <td className="px-4 py-2">Description</td>
                                {selectedEndpoint?.request?.body?.find(
                                  (field: Record<string, any>) => field.enum !== undefined,
                                ) && (
                                  <td className="border-r border-slate-200 px-4 py-2">Options</td>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedEndpoint?.request?.body?.map(
                                (field: Record<string, any>) => (
                                  <tr>
                                    <td className="border-r border-slate-200 px-4 py-2">
                                      {field.name}
                                    </td>
                                    <td className="border-r border-slate-200 px-4 py-2">
                                      {field.type}
                                    </td>
                                    <td className="border-r border-slate-200 px-4 py-2 text-center">
                                      {field.required ? 'yes' : 'no'}
                                    </td>
                                    <td className="border-r border-slate-200 px-4 py-2">
                                      {field.description}
                                    </td>
                                    {field.enum && (
                                      <td className="border-r border-slate-200 px-4 py-2">
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
                      className="bg-primary! hover:border-primary! hover:text-primary mt-auto flex w-full gap-3 border-3! border-transparent py-6! text-xl! font-semibold text-white duration-300 hover:bg-white!"
                    >
                      Send Request <SendHorizontal />
                    </Button>
                  </div>
                </div>

                <div className="col bg-muted w-full shrink-0 overflow-y-auto p-7">
                  <Button
                    size={'icon-xl'}
                    className="mb-4 flex w-fit gap-2 bg-transparent! pl-0! text-base text-black duration-300 hover:gap-3"
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
              className={`max-h-[calc(44rem-90.13px)] max-w-1/2 flex-1 bg-[#0f172a] py-7 ${executionLoading && 'col-full-center'}`}
            >
              {!executionLoading && (
                <div className="flex-between px-7">
                  <p className="border-primary w-fit border-b-4 text-xl font-semibold text-white">
                    Response Example
                  </p>
                  <div className="flex gap-3">
                    <div className="align-center flex w-fit gap-3 rounded-full bg-[#10b981]/40 px-3 text-white!">
                      <div className="size-2 animate-pulse rounded-full bg-[#10b981]"></div>
                      200 OK
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(selectedEndpoint.responseSample, null, 2))
                      }
                      size={'icon-lg'}
                      className="text-primary border-gray-400! bg-white! p-2! hover:bg-white/60!"
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
              )}

              <div className={`rounded-md ${executionLoading && 'flex-center bg-transparent'}`}>
                {executionLoading ? (
                  <Loader2 size={35} className="text-primary! animate-spin" />
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
