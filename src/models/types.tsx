import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type PrimitiveType = 'string' | 'number' | 'boolean';

export interface RateLimit {
  limit: number;
  window: 'second' | 'minute' | 'hour' | 'day';
}

export interface AuthenticationConfig {
  type: 'Bearer' | string;
  headerName: string;
}

export interface RequestField {
  name: string;
  type: PrimitiveType;
  required: boolean;
  description?: string;
  enum?: string[];
}

export interface EndpointRequest {
  queryParams?: RequestField[] | null;
  pathParams?: RequestField[] | null;
  headers?: string | null;
  body?: RequestField[] | null;
}

export interface Endpoint extends ApiEndpoint {
  name: string;
}

export interface ApiEndpoint {
  description: string;
  path: string;
  method: HttpMethod;
  authenticated: boolean;
  isLogin?: boolean;
  request: EndpointRequest;
  responseSample: unknown;
}

export interface ApiResourceGroup {
  groupName: string;
  endpoints: ApiEndpoint[];
}

export interface ApiDefinition {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  version: string;
  baseUrl: string;
  isExampleApi: boolean;
  rateLimit: RateLimit;
  resources: ApiResourceGroup[];
  authentication: AuthenticationConfig;
}

export interface ModalProps {
  headerIcon?: LucideIcon;
  headerContent?: ReactNode;
  title?: string;
  description?: string;
  triggerText?: string;
  triggerStyles?: string;
  triggerElement?: ReactNode;
  containerStyles?: ReactNode;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  onOpenChange?: (value: boolean) => void;
}
