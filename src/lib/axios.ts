import axios from 'axios';

export const httpClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type AuthProps = {
  type?: string;
  headerName: string;
  token: string;
};

export interface RequestProps {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  queryParams?: string | Record<string, any>;
  pathParams?: string;
  body?: Record<string, any>;
  headers?: Record<string, any>;
}

export interface ExecuteHttpRequestProps extends RequestProps {
  auth?: AuthProps;
}

export async function executeHttpRequest({
  // baseUrl,
  url,
  method,
  // path,
  // pathParams,
  queryParams,
  body,
  headers,
  auth,
}: ExecuteHttpRequestProps) {
  // const url = baseUrl + pathParams;

  const finalHeaders = {
    ...headers,
  } as Record<string, any>;

  // Handle authentication if provided
  if (auth?.type === 'Bearer' || auth?.token) {
    finalHeaders[auth.headerName || 'Authorization'] =
      `${auth?.type === 'Bearer' ? 'Bearer ' : ''}${auth.token}`;
  }

  if (auth?.type === 'API_KEY' && auth?.token) {
    finalHeaders[auth.headerName || 'X-Api-Key'] = auth.token;
  }

  console.log({ finalHeaders });

  const axiosParams: any = queryParams && typeof queryParams === 'object' ? queryParams : undefined;

  try {
    const response = await httpClient({
      url,
      method: method.toLowerCase(),
      params: axiosParams,
      data: body,
      headers: finalHeaders,
    });

    console.log({ response });

    return {
      data: response.data,
      headers: response.headers,
      SwagsterStatusCode: response.status || 'UNKNOWN ERROR',
    };
  } catch (error: any) {    
    if (error.response) {
      return {
        error: error.response.data,
        SwagsterStatusCode: error.response.status || 'UNKNOWN ERROR',
      };
    }

    const isCrossOrigin = new URL(error.config?.url || url).origin !== window.location.origin;
    let message = '';

    if (
      isCrossOrigin &&
      error?.isAxiosError &&
      !error?.response &&
      error?.request &&
      error?.code === 'ERR_NETWORK'
    ) {
      message =
        'Request failed. This might be due to CORS restrictions. Please check the browser console for more details.';
    } else {
      message = error.message;
    }

    return {
      error: { success: false, message },
      SwagsterStatusCode: error?.code || 'UNKNOWN ERROR',
    };
  }
}

export function generateCurl({ url, method, body, headers, queryParams }: RequestProps) {
  console.log({ body });

  // Only accept queryParams as string
  let finalUrl = url;
  if (queryParams && typeof queryParams === 'string') {
    finalUrl +=
      queryParams.startsWith('?') || queryParams.startsWith('&') ? queryParams : `?${queryParams}`;
  }

  return `
  curl -X ${method.toUpperCase()} "${finalUrl}" \
  ${Object.entries(headers || {})
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(' \\\n')} \
  ${body ? `-d '${JSON.stringify(body)}'` : ''}
  `;
}
