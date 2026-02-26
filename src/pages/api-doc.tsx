import ApiEndpointsSection from '@/components/ApiEndpointsSection';
import { EndpointRequestDetails } from '@/components/EndpointRequestDetails';
import FormBuilder from '@/components/form/FormBuilder';
import AuthModal from '@/components/modals/AuthModal';
import Navbar from '@/components/Navbar';
import PrimaryButton from '@/components/PrimaryButton';
import { executeHttpRequest, generateCurl, type ExecuteHttpRequestProps } from '@/lib/axios';
import { methodColorMap } from '@/lib/constants';
import { type ApiDefinition, type Endpoint, type HttpMethod } from '@/models/types';
import {
  Computer,
  Copy,
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

  async function copyToClipboard(text?: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.success('Failed to copy');
      console.error('Failed to copy:', err);
    }
  }

  const extractResourceUrl = (vals: any) => {
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

  async function submitRequest(vals?: Record<string, unknown>) {
    setExecutionLoading(true);

    const extractedData = extractResourceUrl(vals);
    const resourceUrl = vals ? extractedData?.resourceUrl : selectedEndpoint?.path;

    const props: ExecuteHttpRequestProps = {
      url: api?.baseUrl + resourceUrl,
      method: selectedEndpoint?.method,
      auth: {
        headerName: api?.authentication.headerName || '',
        token: localStorage.getItem('auth-' + api?.name) || '',
      },
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
    } else {
      setExecutionError({
        ...response.error,
        SwagsterStatusCode: response.SwagsterStatusCode,
      });
    }

    setExecutionLoading(false);
  }

  const formattedError = () => {
    if (!executionError) return undefined;

    const { SwagsterStatusCode, ...rest } = executionError;
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
    if (
      selectedEndpoint?.method === 'GET' &&
      !selectedEndpoint?.request?.queryParams &&
      !selectedEndpoint?.request?.pathParams
    ) {
      submitRequest();
      setExecutionLoading(true);
    } else setShowSecondPanel(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div>
        <div className="p-6 px-6 md:px-12">
          <div className="mb-3 flex gap-2">
            <h1 className="text-4xl!">{api?.name}</h1>
            <p className="bg-accent text-primary mt-2 size-fit rounded-full border border-black/20 px-2 text-xs">
              v{api?.version}
            </p>
          </div>

          <p className="mb-2 max-w-6xl text-sm">{api?.description}</p>
          <Link
            to={api?.baseUrl as string}
            target="_blank"
            className="text-sm text-black! hover:text-blue-500! hover:underline!"
          >
            {api?.baseUrl}
          </Link>

          {api?.isExampleApi && (
            <div className="bg-tropic-blue/40 before:bg-primary relative mt-5 w-120 overflow-hidden rounded-md px-5 py-2 text-sm font-semibold before:absolute before:top-0 before:left-0 before:h-full before:w-1">
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
            className="col max-h-140 min-h-3/5 max-w-11/12 min-w-4/5 rounded-md bg-white lg:max-h-140 lg:max-w-5xl lg:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="align-center gap-3 border-b-3 border-gray-200 px-7 py-3">
              <div className="bg-primary/15 text-primary flex-center rounded-lg p-2">
                <Computer size={27} />
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

            <div className="col min-h-0 gap-5 overflow-x-hidden overflow-y-auto lg:flex! lg:grow lg:flex-row! lg:gap-0 lg:overflow-y-visible">
              <div className="relative flex-1 gap-5 lg:max-h-[calc(35rem-74.4px)] lg:min-h-0 lg:gap-0 lg:overflow-x-hidden">
                <div
                  className={`flex h-auto transition-transform duration-500 ease-in-out lg:h-full ${
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
                              className={`w-fit rounded-md px-3 py-1 text-xs text-white! ${methodColorMap[selectedEndpoint?.method as HttpMethod].custom}`}
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

                              {selectedEndpoint?.authenticated && `(${api?.authentication.type})`}
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
                        className="mt-10 font-semibold lg:mt-auto"
                      >
                        Send Request <SendHorizontal />
                      </PrimaryButton>
                    </div>
                  </div>

                  <div className="col bg-muted h-full w-full shrink-0 p-5 lg:overflow-y-auto">
                    <Button
                      size={'icon-lg'}
                      className="mb-4 flex w-fit gap-2 bg-transparent! pl-0! text-sm text-black transition-all! duration-100 hover:gap-3"
                      onClick={() => setShowSecondPanel(false)}
                    >
                      <MoveLeft /> Back
                    </Button>

                    {showRequestForm() && (
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
                className={`max-h-[calc(35rem-74.4px)] flex-1 bg-[#0f172a] py-5 lg:min-h-0 lg:max-w-1/2 ${executionLoading && 'col-full-center'}`}
              >
                {!executionLoading && (
                  <div className="flex-between px-7">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedTab('response')}
                        className={`${selectedTab === 'response' ? 'border-primary' : 'border-transparent'} w-fit rounded-none! border-b-3! p-1! text-sm font-semibold text-white`}
                      >
                        {executionError ? 'Server Response' : 'Response Example'}
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
                            className={`size-1.5 animate-pulse rounded-full ${executionError ? 'bg-destructive' : 'bg-[#10b981]'}`}
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
                                      extractResourceUrl(formValues?.body)?.resourceUrl,

                                    method: selectedEndpoint?.method,

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
                    <Loader2 size={35} className="text-primary! animate-spin" />
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
                          minHeight: '18.75rem',
                          maxHeight: 'calc(34.98rem - 11.9rem)',
                          fontSize: '13px',
                          colorScheme: 'dark',
                        }}
                      >
                        {selectedTab === 'curl'
                          ? formValues || selectedEndpoint?.method === 'GET'
                            ? generateCurl({
                                url:
                                  api?.baseUrl + extractResourceUrl(formValues?.body)?.resourceUrl,
                                method: selectedEndpoint?.method,
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
                                  : selectedEndpoint?.responseSample,
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

      {api?.authentication && <AuthModal />}
    </div>
  );
}
