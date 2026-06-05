import ApiEndpointsSection from '@/components/ApiEndpointsSection';
import { EndpointRequestDetails } from '@/components/EndpointRequestDetails';
import FormBuilder from '@/components/form/FormBuilder';
import AuthModal from '@/components/modals/AuthModal';
import Navbar from '@/components/Navbar';
import PrimaryButton from '@/components/PrimaryButton';
import { Button } from '@/components/ui/button';
import { executeHttpRequest, generateCurl, type ExecuteHttpRequestProps } from '@/lib/axios';
import { methodColorMap } from '@/lib/constants';
import { apiIcons, getIcon } from '@/lib/icons';
import { cn, copyToClipboard } from '@/lib/utils';
import { type ApiDefinition, type Endpoint, type HttpMethod } from '@/models/types';
import {
  BrushCleaning,
  Computer,
  Copy,
  Loader2,
  MoveLeft,
  SendHorizontal,
  Server,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import registry from '../api-data/registry';

export default function ApiDoc() {
  const params = useParams();
  const api = registry.apis.find((api) => api.id === params.name);

  if (!api) {
    useEffect(() => {
      document.title = 'API not found';
    }, []);

    return (
      <div className="col h-screen">
        <Navbar />
        <div className="flex-center col-center text-primary grow text-center text-3xl font-medium">
          <p className="from-primary bg-linear-to-r to-violet-400 bg-clip-text text-[12rem] font-bold text-transparent">
            404
          </p>
          Sorry we counldn't find that API :(
          <Link
            className="align-center bg-primary mt-12 gap-3 rounded-full px-6 py-1 text-xl text-white!"
            to="/"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    document.title = `${api.name} docs`;
  }, [api.name]);

  const [apiPanelOpen, setApiPanelOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>();

  const [showSecondPanel, setShowSecondPanel] = useState(false);
  const [executionLoading, setExecutionLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState<'response' | 'curl'>('response');
  const [formValues, setFormValues] = useState<Record<string, unknown> | undefined>();

  type ExecutionError = {
    SwagsterStatusCode: string | number;
  } & Record<string, unknown>;

  const [executionError, setExecutionError] = useState<ExecutionError | undefined>();
  const [executionResponse, setExecutionResponse] = useState<any>(undefined);
  const [executionTime, setExecutionTime] = useState<number | undefined>();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiPanelOpen(false);
    setFormValues(undefined);
    setSelectedTab('response');
    setExecutionResponse(undefined);
    setExecutionError(undefined);
    setShowSecondPanel(false);
  }, [location.pathname]);

  useEffect(() => {
    if (apiPanelOpen) {
      const previousFocus = document.activeElement as HTMLElement;
      modalRef.current?.focus();

      return () => {
        previousFocus?.focus();
      };
    }
  }, [apiPanelOpen]);

  const extractResources = (vals: any) => {
    if (!vals && selectedEndpoint?.method !== 'GET') return;

    const formattedConfig = formattedFormConfig();

    const pathParams = formattedConfig.filter((field) => field.source === 'path');
    const queryParams = formattedConfig.filter((field) => field.source === 'query');

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

    const resourceUrl = pathParams?.reduce(
      (acc, param: { name: string }) =>
        acc.replace(
          `{${param.name}}`,
          vals?.[param.name] ?? (formValues?.path as any)?.[param.name] ?? '',
        ),
      selectedEndpoint?.path,
    );

    const searchParams = new URLSearchParams();
    const paramsObj: undefined | Record<string, string | number> = queryParams.length
      ? {}
      : undefined;

    if (queryParams.length && paramsObj) {
      queryParams.forEach((param) => {
        const value = vals?.[param.name] ?? (formValues?.query as any)?.[param.name] ?? '';

        if (value === undefined || value === null || value === '') return;

        searchParams.append(param.name, String(value));
        paramsObj[param.name] = value as string | number;
      });
    }

    const queryUrl = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return {
      resourceUrl,
      queryUrl,
      queryParams: paramsObj,
      body,
    };
  };

  function handleExecutionTime(ms: number) {
    const seconds = ms / 1000;
    setExecutionTime(Number(seconds.toFixed(2)));
  }

  async function submitRequest(vals?: Record<string, unknown>) {
    setExecutionLoading(true);

    const extractedData = extractResources(vals);
    const resourceUrl = vals ? extractedData?.resourceUrl : selectedEndpoint?.path;

    const props: ExecuteHttpRequestProps = {
      url: api?.baseUrl + resourceUrl,
      method: selectedEndpoint?.method,
      ...(api?.authentication
        ? {
            auth: {
              headerName: api?.authentication?.headerName || '',
              token: localStorage.getItem('auth-' + api?.name)?.replace(/^Bearer /, '') || '',
              type: api?.authentication.type || '',
            },
          }
        : {}),
    };

    if (extractedData?.queryParams) {
      props.queryParams = extractedData.queryParams;
    }

    if (vals && Object.keys(vals).length) {
      props.body = extractedData?.body;
    }

    const response = await executeHttpRequest(props);

    if (response?.data?.success) {
      setExecutionError(undefined);
      setExecutionResponse(response.data);
      handleExecutionTime(response.SwagsterexecutionTimeMs);
    } else {
      setExecutionError({
        ...response.error,
        SwagsterStatusCode: response.SwagsterStatusCode,
      });
      handleExecutionTime(response.SwagsterexecutionTimeMs);
    }

    setExecutionLoading(false);
  }

  const formattedError = () => {
    if (!executionError) return undefined;

    const { SwagsterStatusCode, SwagsterexecutionTimeMs, ...rest } = executionError;
    return rest;
  };

  const formattedFormConfig = () => {
    return [
      ...(selectedEndpoint?.request?.pathParams || []).map((field: any) => ({
        ...field,
        source: 'path',
      })),
      ...(selectedEndpoint?.request?.queryParams || []).map((field: any) => ({
        ...field,
        source: 'query',
      })),
      ...(selectedEndpoint?.request?.body || []).map((field: any) => ({
        ...field,
        source: 'body',
      })),
    ];
  };

  const retriveBodyFields = (formValues: any) => {
    if (!formValues) return undefined;
    const pathFields = selectedEndpoint?.request?.pathParams?.map((field: any) => field.name) || [];
    const queryFields =
      selectedEndpoint?.request?.queryParams?.map((field: any) => field.name) || [];
    const bodyFields = selectedEndpoint?.request?.body?.map((field: any) => field.name) || [];

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

  const showRequestForm = () => {
    return (
      selectedEndpoint?.request?.body ||
      selectedEndpoint?.request?.queryParams ||
      selectedEndpoint?.request?.pathParams
    );
  };

  const decideFirstPanelAction = () => {
    const noParams =
      !selectedEndpoint?.request?.queryParams && !selectedEndpoint?.request?.pathParams;
    if (
      (selectedEndpoint?.method === 'GET' && noParams) ||
      (noParams && !selectedEndpoint?.request.body)
    ) {
      submitRequest();
      setExecutionLoading(true);
    } else setShowSecondPanel(true);
  };

  const Icon = getIcon(api.icon as keyof typeof apiIcons);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <div className="p-6 px-6 md:px-12">
          <div className="mb-3 flex gap-2">
            <h1 className="text-4xl!">{api?.name}</h1>
            <p className="bg-accent text-primary mt-2 size-fit rounded-full border border-black/20 px-2 text-xs">
              v{api?.version}
            </p>
          </div>

          <p className="mb-2 max-w-6xl text-sm">{api?.description}</p>

          <div className="group flex-center-gp w-fit">
            <Link
              to={api?.baseUrl as string}
              target="_blank"
              className="text-sm text-black! hover:text-blue-500! hover:underline! focus-visible:text-blue-500!"
            >
              {api?.baseUrl}
            </Link>

            <Button
              onClick={() => copyToClipboard(api?.baseUrl)}
              className="bg-accent text-primary hover:bg-accent/20 focus-visible:bg-accent/20 size-6 rounded-md! border border-gray-400 p-3! opacity-0 transition-all! duration-300 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Copy className="size-3" />
            </Button>
          </div>

          {api?.isExampleApi && (
            <div className="bg-tropic-blue/40 before:bg-primary relative mt-5 w-full overflow-hidden rounded-md px-5 py-2 text-sm font-semibold before:absolute before:top-0 before:left-0 before:h-full before:w-1 sm:w-120">
              <p className="flex gap-2">
                This is an example API. It is not intended for real use. <br />
                Check The Subscription API for testing.
              </p>
            </div>
          )}
        </div>

        <ApiEndpointsSection
          api={api as ApiDefinition}
          setSelectedEndpoint={setSelectedEndpoint}
          setApiPanelOpen={setApiPanelOpen}
        />
      </main>

      {apiPanelOpen && (
        <div
          className={`size-screen fixed inset-0 hidden bg-black/30 ${apiPanelOpen ? 'flex-center' : 'hidden'}`}
          ref={modalRef}
          tabIndex={-1}
          onClick={() => {
            setApiPanelOpen(false);
            setFormValues(undefined);
            setSelectedTab('response');
            setExecutionResponse(undefined);
            setExecutionError(undefined);
            setShowSecondPanel(false);
          }}
        >
          <div
            className="col max-h-140 min-h-3/5 max-w-11/12 min-w-4/5 rounded-md bg-white lg:max-h-140 lg:max-w-5xl lg:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="align-center gap-3 border-b-3 border-gray-200 px-7 py-3">
              <div className="bg-primary/15 text-primary flex-center rounded-lg p-2">
                <Icon size={27} />
              </div>

              <div>
                <h2 className="text-primary text-[18.5px] font-semibold">
                  {selectedEndpoint?.name} Endpoint
                </h2>

                <div className="text-muted-foreground flex text-sm">
                  <p>{api?.name}</p> • <p>V{api?.version}</p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                { 'bg-white': !showSecondPanel, 'bg-muted': showSecondPanel },
                'col min-h-0 gap-5 overflow-x-hidden overflow-y-auto duration-500 lg:flex! lg:grow lg:flex-row! lg:gap-0 lg:overflow-y-visible',
              )}
            >
              <div className="bg-muted relative flex-1 gap-5 lg:max-h-[calc(35rem-74.4px)] lg:min-h-0 lg:gap-0 lg:overflow-x-hidden">
                <div
                  className={`flex h-auto bg-white transition-transform duration-500 ease-in-out lg:h-full ${
                    showSecondPanel ? '-translate-x-full' : 'translate-x-0'
                  }`}
                >
                  <div className="w-full shrink-0 lg:overflow-y-auto">
                    <div className="col h-auto space-y-6 p-5 lg:min-h-full">
                      <div>
                        <p>Resouce Path</p>

                        <div className="bg-muted flex-between mt-2 rounded-md border border-gray-200 px-4 py-2 text-black">
                          <div className="flex gap-4">
                            <div
                              className={`w-fit rounded-md px-3 py-1 text-xs text-white! ${methodColorMap[selectedEndpoint?.method as HttpMethod].solid}`}
                            >
                              {selectedEndpoint?.method}
                            </div>

                            <p className="align-center gap-2 text-sm font-medium">
                              {selectedEndpoint?.path}
                            </p>
                          </div>

                          <Button
                            onClick={() => copyToClipboard(selectedEndpoint?.path)}
                            size={'icon-sm'}
                            tabIndex={showSecondPanel ? -1 : 0}
                            className="text-primary rounded-md! border-gray-400! bg-white! p-3! hover:bg-white/20!"
                          >
                            <Copy />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p>Description</p>

                        <p className="text-muted-foreground text-sm">
                          {selectedEndpoint?.description}
                        </p>

                        <div className="mt-2 flex gap-4">
                          <div className="bg-muted col mt-1 flex-1 gap-1 rounded-md border border-gray-200 px-4 py-2 text-black">
                            <p className="align-center text-primary gap-2 text-sm">
                              <ShieldCheck size={16} /> Authentication
                            </p>

                            <p className="pl-6 text-xs">
                              {selectedEndpoint?.authenticated ? 'Required ' : 'Not Required'}

                              {selectedEndpoint?.authenticated && `(${api?.authentication?.type})`}
                            </p>
                          </div>

                          {api?.rateLimit && (
                            <div className="bg-muted col mt-1 flex-1 gap-1 rounded-md border border-gray-200 px-4 py-2 text-black">
                              <p className="align-center text-primary gap-2 text-sm">
                                <Server size={14} /> Rate Limit
                              </p>

                              <p className="pl-5.5 text-xs">
                                {api?.rateLimit.limit} Requests/{api?.rateLimit.window}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <EndpointRequestDetails selectedEndpoint={selectedEndpoint} />

                      <PrimaryButton
                        size={'icon-lg'}
                        onClick={decideFirstPanelAction}
                        loading={executionLoading}
                        tabIndex={showSecondPanel ? -1 : 0}
                        className="mt-10 font-semibold lg:mt-auto"
                      >
                        Send Request <SendHorizontal />
                      </PrimaryButton>
                    </div>
                  </div>

                  {showRequestForm() && (
                    <div
                      tabIndex={-1}
                      className="col bg-muted h-full w-full shrink-0 p-5 lg:overflow-y-auto"
                    >
                      <Button
                        size={'icon-lg'}
                        className={`mb-4 flex w-fit gap-2 bg-transparent! pl-0! text-sm text-black transition-all! duration-100 hover:gap-3 ${!showSecondPanel ? 'pointer-events-none' : ''}`}
                        tabIndex={showSecondPanel ? 0 : -1}
                        onClick={() => setShowSecondPanel(false)}
                      >
                        <MoveLeft /> Back
                      </Button>

                      <FormBuilder
                        formConfig={formattedFormConfig()}
                        disableForm={!showSecondPanel}
                        onSubmit={(vals) => submitRequest(vals)}
                        returnValues={(vals) => setFormValues(retriveBodyFields(vals))}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`relative max-h-[calc(35rem-74.4px)] flex-1 bg-[#0f172a] pt-5 pb-13 lg:min-h-0 lg:max-w-1/2 ${executionLoading && 'col-full-center'}`}
              >
                {!executionLoading && (
                  <div className="flex-between px-7">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedTab('response')}
                        className={`${selectedTab === 'response' ? 'border-primary' : 'border-transparent'} w-fit rounded-none! border-b-3! p-1! text-sm font-semibold text-white`}
                      >
                        {executionError || executionResponse
                          ? 'Server Response'
                          : 'Response Example'}
                      </button>

                      <button
                        onClick={() => setSelectedTab('curl')}
                        className={`${selectedTab === 'curl' ? 'border-primary' : 'border-transparent'} w-fit rounded-none! border-b-3 p-1! text-sm font-semibold text-white`}
                      >
                        Curl
                      </button>
                    </div>

                    <div className="align-center gap-3">
                      {selectedTab !== 'curl' && (
                        <div
                          className={`align-center flex w-fit gap-2 rounded-full py-1.5 text-xs/snug ${executionError ? 'bg-destructive/40' : 'bg-[#10b981]/40'} px-3 text-white!`}
                        >
                          <div
                            className={`size-1.5 animate-pulse rounded-full ${executionError ? 'bg-destructive' : 'bg-[#30a36c]'}`}
                          ></div>

                          {executionError
                            ? executionError?.SwagsterStatusCode || 'Unknown Error'
                            : '200'}
                        </div>
                      )}

                      <Button
                        onClick={() =>
                          copyToClipboard(
                            selectedTab === 'curl'
                              ? formValues || selectedEndpoint?.method === 'GET'
                                ? generateCurl({
                                    url:
                                      api?.baseUrl +
                                      extractResources(formValues?.body)?.resourceUrl,

                                    method: selectedEndpoint?.method,

                                    body:
                                      formValues?.body && Object?.keys(formValues?.body).length
                                        ? { ...formValues?.body }
                                        : undefined,

                                    queryParams: extractResources(formValues?.body)?.queryUrl,
                                  })
                                : ''
                              : JSON.stringify(
                                  executionError
                                    ? formattedError()
                                    : executionResponse || selectedEndpoint?.responseSample,
                                  null,
                                  2,
                                ),
                          )
                        }
                        size={'icon-sm'}
                        className="text-primary rounded-md! border-gray-400! bg-white! p-2! hover:bg-white/60!"
                      >
                        <Copy />
                      </Button>
                    </div>
                  </div>
                )}

                <div className={`rounded-md ${executionLoading && 'flex-center bg-transparent'}`}>
                  {executionLoading ? (
                    <div className="flex-center h-84">
                      <Loader2 size={35} className="text-primary! animate-spin" />
                    </div>
                  ) : (
                    <div>
                      <SyntaxHighlighter
                        language={selectedTab === 'curl' ? 'bash' : 'json'}
                        style={nightOwl}
                        customStyle={{
                          background: '#0a101d',
                          borderRadius: 8,
                          padding: '1rem 1.75rem ',
                          marginTop: '1rem',
                          overflow: 'auto',
                          minHeight: '21rem',
                          maxHeight: 'calc(34.98rem - 11.9rem)',
                          fontSize: '13px',
                          colorScheme: 'dark',
                        }}
                      >
                        {selectedTab === 'curl'
                          ? formValues || selectedEndpoint?.method === 'GET'
                            ? generateCurl({
                                url: api?.baseUrl + extractResources(formValues?.body)?.resourceUrl,
                                method: selectedEndpoint?.method,
                                body:
                                  formValues?.body && Object?.keys(formValues.body).length
                                    ? { ...formValues.body }
                                    : undefined,
                                queryParams: extractResources(formValues?.body)?.queryUrl,
                              })
                            : ''
                          : JSON.stringify(
                              executionError
                                ? (({ SwagsterStatusCode, ...rest }) => rest)(executionError)
                                : executionResponse
                                  ? executionResponse
                                  : selectedEndpoint?.responseSample,
                              null,
                              2,
                            )}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-3 px-5 text-xs font-bold">
                  <div className="bg-input pointer-events-none absolute bottom-0 left-0 z-0 h-13 w-full"></div>

                  <div className="text-primary relative z-20 flex justify-end gap-5">
                    {!executionLoading && (executionResponse || executionError) && (
                      <div className="mt-1.25 flex items-center gap-1">
                        <Timer strokeWidth="2.5" size={13} className="mb-0.75" /> {executionTime}s
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setExecutionResponse(undefined);
                        setExecutionError(undefined);
                      }}
                      className="transition-all! duration-100"
                      disabled={(!executionError && !executionResponse) || executionLoading}
                    >
                      Clear <BrushCleaning />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {api?.authentication && <AuthModal />}
    </div>
  );
}
