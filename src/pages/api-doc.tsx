import { Alert } from '@/components/Alert';
import { CommandBar } from '@/components/CommandBar';
import FormBuilder, { type FieldProps } from '@/components/form/FormBuilder';
import { executeHttpRequest, generateCurl, type ExecuteHttpRequestProps } from '@/lib/axios';
import { isTokenExpired } from '@/lib/utils';
import {
  AlertTriangle,
  BadgeCheck,
  BadgeInfo,
  BrushCleaning,
  Computer,
  Copy,
  FingerprintPattern,
  KeySquare,
  Link as LincIcon,
  Loader2,
  MoveLeft,
  SendHorizontal,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

  console.log({ selectedEndpoint });

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [showSecondPanel, setShowSecondPanel] = useState(false);
  const [executionLoading, setExecutionLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState<'response' | 'curl'>('response');
  const [formValues, setFormValues] = useState<Record<string, unknown> | undefined>();

  console.log(formValues);

  type ExecutionError = {
    SwagsterStatusCode: string | number;
  } & Record<string, unknown>;

  const [executionError, setExecutionError] = useState<ExecutionError | undefined>();
  const [executionResponse, setExecutionResponse] = useState<any>(undefined);

  const [authError, setAuthError] = useState<string | Record<string, unknown> | undefined>();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // initialize when api changes
    setAuthToken(localStorage.getItem('auth-' + api?.name));
  }, [api?.name]);

  useEffect(() => {
    // listen for storage events (other tabs/windows)
    function handleStorage(e: StorageEvent) {
      if (e.key === 'auth-' + api?.name) setAuthToken(e.newValue);
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [api?.name]);

  const clearAuth = () => {
    localStorage.removeItem('auth-' + api?.name);
    setAuthToken(null);
  };

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

  const extractResourceUrl = (vals: any) => {
    if (!vals && selectedEndpoint.method !== 'GET') return;
    const formattedConfig = formattedFormConfig();

    console.log({ vals });
    console.log({ formValues });
    console.log({ formattedConfig });

    const pathParams = formattedConfig.filter((field) => field.source === 'path');
    const queryParams = formattedConfig.filter((field) => field.source === 'query');
    console.log({ pathParams });

    const bodyVals = formattedConfig
      .filter((field) => field.source === 'body')
      .map((field) => field.name);
    const body = !vals
      ? undefined
      : Object.fromEntries(
          Object.entries(vals).filter(
            ([key, value]) => bodyVals.includes(key) && value != null && value !== '',
          ),
        );

    console.log(body);

    const resourceUrl = pathParams?.reduce(
      (acc, param: { name: string }) =>
        acc.replace(
          `{${param.name}}`,
          vals?.[param.name] ?? (formValues?.path as any)?.[param.name] ?? '',
        ),
      selectedEndpoint.path,
    );

    console.log(resourceUrl);

    const searchParams = new URLSearchParams();
    const paramsObj: undefined | Record<string, string | number> = queryParams.length
      ? {}
      : undefined;

    if (queryParams.length && paramsObj) {
      queryParams?.forEach((param) => {
        const value = vals?.[param.name] ?? (formValues?.query as any)?.[param.name] ?? '';

        if (value === undefined || value === null || value === '') return;

        searchParams.append(param.name, String(value));
        paramsObj[param.name] = value as string | number;
      });
    }

    const queryUrl = searchParams.toString() ? `?${searchParams.toString()}` : '';

    console.log(queryUrl);

    return {
      resourceUrl,
      queryUrl,
      queryParams: paramsObj,
      body,
    };
  };

  async function submitRequest(vals?: Record<string, unknown>, auth?: boolean) {
    !auth && setExecutionLoading(true);
    const extractedData = extractResourceUrl(vals);
    const extractedPathUrl = extractedData?.resourceUrl;
    const extractedParams = extractedData?.queryParams;
    const extractedBody = extractedData?.body;

    const resourceUrl = auth
      ? api?.resources[0].endpoints?.[0].path
      : vals
        ? extractedPathUrl
        : selectedEndpoint.path;

    const props: ExecuteHttpRequestProps = {
      url: api?.baseUrl + resourceUrl,
      method: auth ? api?.resources[0].endpoints?.[0].method : selectedEndpoint.method,
      auth: {
        headerName: api?.authentication.headerName || '',
        token: localStorage.getItem('auth-' + api?.name) || '',
      },
    };

    if (extractedParams) {
      props.queryParams = extractedParams;
    }

    if (vals && Object.keys(vals).length) {
      // const filtered = Object.fromEntries(
      //   Object.entries(vals).filter(([_, value]) => value != null && value !== ''),
      // );

      props.body = auth ? vals : extractedBody;
    }
    console.log(props);

    const response = await executeHttpRequest(props);

    console.log({ response });

    if (auth) {
      if (response.data?.success) {
        setAuthError(undefined);
        const token = response.data.data.token;
        if (token) {
          localStorage.setItem('auth-' + api?.name, token);
          setAuthToken(token);
        }
        toast.success('Authorization Successful!');
        setAuthModalOpen(false);
        setExecutionLoading(false);
        return;
      } else {
        setAuthError(response.error);
        setExecutionLoading(false);
        return;
      }
    }
    if (response?.data?.success) {
      setExecutionError(undefined);
      setExecutionResponse(response.data);
      setExecutionLoading(false);
    } else {
      setExecutionError({ ...response.error, SwagsterStatusCode: response.SwagsterStatusCode });
      setExecutionLoading(false);
    }
  }

  const formattedError = () => {
    if (!executionError) return undefined;

    const { SwagsterStatusCode, ...rest } = executionError;
    return rest;
  };

  const formattedFormConfig = () => {
    return [
      ...(selectedEndpoint.request?.pathParams || []).map((field: any) => ({
        ...field,
        source: 'path',
      })),
      ...(selectedEndpoint.request?.queryParams || []).map((field: any) => ({
        ...field,
        source: 'query',
      })),
      ...(selectedEndpoint.request?.body || []).map((field: any) => ({ ...field, source: 'body' })),
    ];
  };

  const retriveBodyFields = (formValues: any) => {
    if (!formValues) return undefined;
    const pathFields = selectedEndpoint.request?.pathParams?.map((field: any) => field.name) || [];
    const queryFields =
      selectedEndpoint.request?.queryParams?.map((field: any) => field.name) || [];
    const bodyFields = selectedEndpoint.request?.body?.map((field: any) => field.name) || [];

    const vals = (selectedFields: any) =>
      Object.fromEntries(
        Object.entries(formValues).filter(([key]) => selectedFields.includes(key)),
      );

    return {
      body: vals(bodyFields),
      path: vals(pathFields),
      query: vals(queryFields),
    };
  };

  return (
    <div className="min-h-screen">
      <nav className="flex bg-black px-10 py-4 text-white">
        <div className="align-center gap-4">
          <img src="/logo.png" width={50} alt="swagster logo" />
          <div className="col">
            <Link to={'/'} className="text-2xl font-medium text-white!">
              Swagster
            </Link>
            <span>By Steeve</span>
          </div>
        </div>

        <div className="just-end w-full items-center">
          <CommandBar />
        </div>
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

          {api?.isExampleApi && (
            <div className="bg-tropic-blue/40 before:bg-primary relative mt-5 w-120 overflow-hidden rounded-md px-5 py-2 text-lg font-semibold before:absolute before:top-0 before:left-0 before:h-full before:w-1">
              <p className="flex gap-2">
                <BadgeInfo className="text-primary -translate-y-1.5" size={40} /> This is an example
                API. It is not intended for real use. Check The Subscription API for testing.
              </p>
            </div>
          )}
        </div>

        <div className="bg-accent mt-3 min-h-screen space-y-10 p-10">
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
                      className={`flex-between cursor relative gap-4 overflow-hidden px-4 py-3 sm:min-w-2xl ${getMethodClasses(endpoint.method, { variant: 'light', hover: true })} after:bg-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:transition-all after:duration-100 after:content-[''] hover:after:h-1 focus-visible:after:h-1`}
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
                        <ShieldCheck size={28} className="fill-primary/70 text-black/70" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {apiPanelOpen && (
        <div
          className={`fixed inset-0 hidden h-screen w-screen bg-black/30 ${apiPanelOpen ? 'flex-center' : 'hidden'}`}
          onClick={() => {
            setApiPanelOpen(false);
            setFormValues(undefined);
          }}
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
                            <p className="pl-10">
                              {selectedEndpoint?.authenticated ? 'Required ' : 'Not Required'}
                              {selectedEndpoint?.authenticated && `(${api?.authentication.type})`}
                            </p>
                          </div>
                          {api?.rateLimit && (
                            <div className="bg-muted col mt-1 flex-1 gap-1 rounded-xl border border-gray-200 px-4 py-3 text-black">
                              <p className="align-center text-primary gap-4 text-lg">
                                <Server size={19} /> Rate Limit
                              </p>
                              <p className="pl-10">
                                {api?.rateLimit.limit} Requests/{api?.rateLimit.window}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedEndpoint?.request?.pathParams && (
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
                                  {selectedEndpoint?.request?.pathParams?.find(
                                    (field: Record<string, any>) => field.enum !== undefined,
                                  ) && (
                                    <td className="border-r border-slate-200 px-4 py-2">Options</td>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {selectedEndpoint?.request?.pathParams?.map(
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

                      {selectedEndpoint?.request?.queryParams && (
                        <div>
                          <p className="text-xl">query Parameters</p>
                          <div className="mt-2 overflow-x-auto overflow-y-hidden rounded-sm border border-slate-200">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr className="text-primary">
                                  <td className="px-4 py-2">Name</td>
                                  <td className="px-4 py-2">Type</td>
                                  <td className="px-4 py-2">Required</td>
                                  <td className="px-4 py-2">Description</td>
                                  {selectedEndpoint?.request?.queryParams?.find(
                                    (field: Record<string, any>) => field.enum !== undefined,
                                  ) && (
                                    <td className="border-r border-slate-200 px-4 py-2">Options</td>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {selectedEndpoint?.request?.queryParams?.map(
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

                      {selectedEndpoint?.request?.body && (
                        <div>
                          <p className="text-xl">Body Parameters</p>
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
                        disabled={executionLoading}
                        onClick={() => {
                          if (
                            selectedEndpoint?.method === 'GET' &&
                            !selectedEndpoint?.request?.queryParams &&
                            !selectedEndpoint?.request?.pathParams
                          ) {
                            submitRequest();
                            setExecutionLoading(true);
                          } else setShowSecondPanel(true);
                        }}
                        className="bg-primary! hover:border-primary! hover:text-primary mt-auto flex w-full gap-3 border-3! border-transparent py-6! text-xl! font-semibold text-white duration-300 hover:bg-white!"
                      >
                        {executionLoading ? (
                          <>
                            Processing <Loader2 className="animate-spin"></Loader2>
                          </>
                        ) : (
                          <>
                            Send Request <SendHorizontal />
                          </>
                        )}
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

                    {(selectedEndpoint?.request?.body ||
                      selectedEndpoint?.request?.queryParams ||
                      selectedEndpoint?.request?.pathParams) && (
                      <FormBuilder
                        formConfig={formattedFormConfig()}
                        onSubmit={(vals) => submitRequest(vals)}
                        returnValues={(vals) => setFormValues(retriveBodyFields(vals))}
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
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedTab('response')}
                        className={`${selectedTab === 'response' ? 'border-primary' : 'border-transparent'} w-fit rounded-none! border-b-4! p-1! text-xl font-semibold text-white`}
                      >
                        {executionError ? 'Server Response' : 'Response Example'}
                      </button>
                      <button
                        onClick={() => setSelectedTab('curl')}
                        className={`${selectedTab === 'curl' ? 'border-primary' : 'border-transparent'} w-fit rounded-none! border-b-4 p-1! text-xl font-semibold text-white`}
                      >
                        Curl
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {selectedTab !== 'curl' && (
                        <div
                          className={`align-center flex w-fit gap-3 rounded-full ${executionError ? 'bg-destructive/40' : 'bg-[#10b981]/40'} px-3 text-white!`}
                        >
                          <div
                            className={`size-2 animate-pulse rounded-full ${executionError ? 'bg-destructive' : 'bg-[#10b981]'}`}
                          ></div>
                          {executionError
                            ? executionError?.SwagsterStatusCode || 'Unknown Error'
                            : '200 OK'}
                        </div>
                      )}
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            selectedTab === 'curl'
                              ? formValues || selectedEndpoint.method === 'GET'
                                ? generateCurl({
                                    url:
                                      api?.baseUrl +
                                      extractResourceUrl(formValues?.body)?.resourceUrl,
                                    method: selectedEndpoint.method,
                                    body:
                                      formValues?.body && Object?.keys(formValues?.body).length
                                        ? { ...formValues?.body }
                                        : undefined,
                                    queryParams: extractResourceUrl(formValues?.body)?.queryUrl,
                                  })
                                : ''
                              : JSON.stringify(
                                  executionError
                                    ? formattedError()
                                    : executionResponse || selectedEndpoint.responseSample,
                                  null,
                                  2,
                                ),
                          )
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
                    <div>
                      <SyntaxHighlighter
                        language={selectedTab === 'curl' ? 'bash' : 'json'}
                        style={nightOwl}
                        customStyle={{
                          background: '#0a101d',
                          borderRadius: 8,
                          padding: '1rem 2.75rem ',
                          marginTop: '1rem',
                          overflow: 'auto',
                          minHeight: '18.75rem',
                          maxHeight: 'calc(44rem - 184.13px)',
                          colorScheme: 'dark',
                        }}
                      >
                        {selectedTab === 'curl'
                          ? formValues || selectedEndpoint.method === 'GET'
                            ? generateCurl({
                                url:
                                  api?.baseUrl + extractResourceUrl(formValues?.body)?.resourceUrl,
                                method: selectedEndpoint.method,
                                body:
                                  formValues?.body && Object?.keys(formValues.body).length
                                    ? { ...formValues.body }
                                    : undefined,
                                queryParams: extractResourceUrl(formValues?.body)?.queryUrl,
                              })
                            : ''
                          : JSON.stringify(
                              executionError
                                ? (({ SwagsterStatusCode, ...rest }) => rest)(executionError)
                                : executionResponse
                                  ? executionResponse
                                  : selectedEndpoint.responseSample,
                              null,
                              2,
                            )}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {authModalOpen && (
        <div
          className={`fixed inset-0 z-10 hidden h-screen w-screen bg-black/30 ${authModalOpen ? 'flex-center' : 'hidden'}`}
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="col min-h-200 min-w-2xl rounded-md bg-white"
          >
            <header className="flex gap-4 border-b border-gray-200 px-7 py-4">
              <div className="bg-primary/15 text-primary flex-center rounded-lg px-3">
                <FingerprintPattern size={35} />
              </div>
              <div>
                <h2 className="text-primary text-2xl font-semibold">Authorization</h2>
                <p className="text-muted-foreground">
                  Enter your credentials to authorize requests
                </p>
              </div>
            </header>

            <div className="flex grow p-7">
              {authToken ? (
                isTokenExpired(`auth-${api?.name}`) ? (
                  <div className="w-full">
                    <Alert
                      icon={AlertTriangle}
                      className="bg-destructive/40"
                      variant="destructive"
                      title="Unauthorized"
                    >
                      Token Expired
                    </Alert>
                    <Button
                      onClick={clearAuth}
                      size={'icon-xl'}
                      className="mt-4 flex w-full gap-4 py-6! text-lg"
                    >
                      Clear Auth Token <BrushCleaning className="mb-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <Alert
                      icon={BadgeCheck}
                      className="bg-[#10b981]/40"
                      variant="success"
                      title="Authorized"
                    >
                      Api Is Authorized
                    </Alert>
                    <Button
                      onClick={clearAuth}
                      size={'icon-xl'}
                      className="mt-4 flex w-full gap-4 py-6! text-lg"
                    >
                      Clear Auth Token <BrushCleaning className="mb-1" />
                    </Button>
                  </div>
                )
              ) : (
                <FormBuilder
                  formConfig={api?.resources[0].endpoints?.[0].request.body as FieldProps[]}
                  onSubmit={(vals) => submitRequest(vals, true)}
                  alertText={authError}
                  buttonStyles="mt-auto"
                  buttonText="Authorize"
                  buttonIcon={<KeySquare />}
                  disableGroupuing
                />
              )}
            </div>
          </div>
        </div>
      )}

      {api?.authentication && (
        <Button
          size={'icon-xl'}
          onClick={() => setAuthModalOpen(true)}
          className="bg-primary align-center fixed right-10 bottom-12 z-1 w-fit gap-4 rounded-full! px-8! py-6! text-xl text-white hover:scale-110 hover:scale-3d"
        >
          Authorize <KeySquare size={50} />
        </Button>
      )}
    </div>
  );
}
