import axios from 'axios';

export const httpClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type AuthProps = {
  type: string;
  headerName: string;
  token: string;
};

export interface RequestProps {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  queryParams?: string;
  pathParams?: string;
  body: Record<string, any>;
  headers?: Record<string, any>;
}

interface ExecuteHttpRequestProps extends RequestProps {
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
  };

  // Handle authentication if provided
  if (auth?.type === 'Bearer' && auth?.token) {
    finalHeaders[auth.headerName || 'Authorization'] = `Bearer ${auth.token}`;
  }

  if (auth?.type === 'API_KEY' && auth?.token) {
    finalHeaders[auth.headerName || 'X-Api-Key'] = auth.token;
  }

  try {
    const response = await httpClient({
      url,
      method: method.toLowerCase(),
      params: queryParams,
      data: body,
      headers: finalHeaders,
    });

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error: any) {
    if (error.response) {
      return {
        error: error.response.data,
        SwagsterStatusCode: error.response.status || 'UNKNOWN ERROR'
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

export function generateCurl({ url, method, body, headers }: RequestProps) {
  return `
curl -X ${method.toUpperCase()} "${url}" \
${Object.entries(headers || {})
  .map(([k, v]) => `-H "${k}: ${v}"`)
  .join(' \\\n')} \
${body ? `-d '${JSON.stringify(body)}'` : ''}
`;
}
