import axios from "axios";

export const httpClient = axios.create({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthProps = {
  type: string,
  headerName: string
  token: string
}

interface RequestProps {
  url: string,
  method: 'GET' | 'POST'| 'PUT' | 'DELETE'
  queryParams: string,
  body: Record<string, any>,
  headers: Record<string, any>,
}

interface ExecuteHttpRequestProps extends RequestProps{
  auth: AuthProps
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
  auth
}: ExecuteHttpRequestProps) {
  // const url = baseUrl + resolvePath(path, pathParams);

  const finalHeaders = {
    ...headers,
  };

  // Handle authentication if provided
  if (auth?.type === "Bearer" && auth?.token) {
    finalHeaders[auth.headerName || "Authorization"] = `Bearer ${auth.token}`;
  }

  if (auth?.type === "API_KEY" && auth?.token) {
    finalHeaders[auth.headerName || "X-Api-Key"] = auth.token;
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
        success: false,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

export function generateCurl({ url, method, body, headers }: RequestProps) {
  return `
curl -X ${method.toUpperCase()} "${url}" \
${Object.entries(headers || {})
  .map(([k, v]) => `-H "${k}: ${v}"`)
  .join(" \\\n")} \
${body ? `-d '${JSON.stringify(body)}'` : ""}
`;
}

