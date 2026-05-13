import type { ApiDefinition } from '@/models/types';

const registry = {
  apis: [
    {
      id: 'subscription-api',
      name: 'Subscription Manager',
      shortDescription: 'Manage user subscriptions lifecycle.',
      description:
        'A comprehensive lifecycle management service for recurring commitments. This API handles the creation, tracking, and modification of user subscriptions across diverse categories (e.g., entertainment, finance). It automatically computes renewal dates based on provided frequencies and supports multi-currency logic, acting as the central source of truth for active user services.',
      version: '1.0',
      icon: 'SquareChartGantt',
      baseUrl: 'https://subscription-management-api.vercel.app/api/v1',
      rateLimit: {
        limit: 15,
        window: 'minute',
      },
      resources: [
        {
          groupName: 'Authentication',
          endpoints: [
            {
              description: 'Login user',
              path: '/auth/sign-in',
              method: 'POST',
              authenticated: false,
              isLogin: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'The User Email',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'The User Password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Login successful',
                data: {
                  token:
                    'eyJhbGciOiJIUzI1asdfasdfasdfpXVCJ9.eyJwsadfalsdjfk2kf8au83knvgjsdaj38fhsadnfbiKJKASc2Nn0.MASNsdfunasJ34kkKfdkjasdfjdfsgiutndleiusfndsdilwelkdfsuj',
                },
              },
            },
            {
              description: 'Create Account',
              path: '/auth/sign-up',
              method: 'POST',
              authenticated: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: 'The User Name',
                  },
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'The User Email',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'The User Password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'User created successfully',
                data: {
                  user: {
                    id: '2874847893892',
                    name: 'Houdini',
                    email: 'bruh@mail.com',
                    createdAt: '2026-02-18T10:47:07.403Z',
                    updatedAt: '2026-02-18T10:47:07.403Z',
                  },
                  token:
                    'eyJhbGciOiJIUzI1asdfasdfasdfpXVCJ9.eyJwsadfalsdjfk2kf8au83knvgjsdaj38fhsadnfbiKJKASc2Nn0.MASNsdfunasJ34kkKfdkjasdfjdfsgiutndleiusfndsdilwelkdfsuj',
                },
              },
            },
          ],
        },
        {
          groupName: 'Subscription',
          endpoints: [
            {
              description: "Gets the user's subscriptions",
              path: '/subscriptions',
              method: 'GET',
              authenticated: true,
              request: {
                queryParams: [
                  {
                    name: 'minPrice',
                    type: 'number',
                    required: false,
                    description: 'Minimum Subscription Price',
                  },
                  {
                    name: 'maxPrice',
                    type: 'number',
                    required: false,
                    description: 'Maximum Subscription Price',
                  },
                  {
                    name: 'frequency',
                    type: 'string',
                    enum: ['daily', 'weekly', 'monthly', 'yearly'],
                    required: false,
                    description: 'The Subscription Frequency',
                  },
                  {
                    name: 'status',
                    type: 'string',
                    required: false,
                    enum: ['active', 'cancelled', 'expired'],
                    description: 'The Subscription Status',
                  },
                ],
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                message: 'subscription created successfully',
                data: {
                  name: 'Netflix',
                  price: 20,
                  currency: 'ETB',
                  frequency: 'daily',
                  category: 'finance',
                  paymentMethod: 'card',
                  status: 'active',
                  startDate: '2026-02-10T20:50:37.461Z',
                  user: '698c7dcb4b15387eda7fd204',
                  _id: '698dae231fa4f252610cfebc',
                  createdAt: '2026-02-12T10:40:35.364Z',
                  updatedAt: '2026-02-12T10:40:35.364Z',
                  renewalDate: '2026-02-11T20:50:37.461Z',
                  __v: 0,
                },
                workflowRunId: 'wfr_p6vm8hS1wthVJXcoQb7xp',
              },
            },
            {
              description: 'Creates a new subscription for a user',
              path: '/subscriptions',
              method: 'POST',
              authenticated: true,
              request: {
                queryParams: null,
                headers: null,
                body: [
                  {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: 'The Subscription Name',
                  },
                  {
                    name: 'frequency',
                    type: 'string',
                    required: true,
                    enum: ['daily', 'weekly', 'monthly', 'yearly'],
                    description: 'The Subscription Frequency',
                  },
                  {
                    name: 'currency',
                    type: 'string',
                    required: false,
                    enum: ['USD', 'ETB'],
                    description: 'The Payment Currency',
                  },
                  {
                    name: 'paymentMethod',
                    type: 'string',
                    required: true,
                    enum: ['card', 'debit'],
                    description: 'The Payment Method',
                  },
                  {
                    name: 'category',
                    type: 'string',
                    required: true,
                    enum: [
                      'sports',
                      'news',
                      'politics',
                      'entertainment',
                      'lifestyle',
                      'technology',
                      'finance',
                      'other',
                    ],
                    description: 'The Subscription Category',
                  },
                  {
                    name: 'price',
                    type: 'number',
                    required: true,
                    description: 'The Subscription Price',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'subscription created successfully',
                data: {
                  name: 'Netflix',
                  price: 20,
                  currency: 'ETB',
                  frequency: 'daily',
                  category: 'finance',
                  paymentMethod: 'card',
                  status: 'active',
                  startDate: '2026-02-10T20:50:37.461Z',
                  user: '698c7dcb4b15387eda7fd204',
                  _id: '698dae231fa4f252610cfebc',
                  createdAt: '2026-02-12T10:40:35.364Z',
                  updatedAt: '2026-02-12T10:40:35.364Z',
                  updaetedAt: '2026-02-12T10:40:35.364Z',
                  updatwedAt: '2026-02-12T10:40:35.364Z',
                  updateddAt: '2026-02-12T10:40:35.364Z',
                  updatedaAt: '2026-02-12T10:40:35.364Z',
                  renewalDate: '2026-02-11T20:50:37.461Z',
                  __v: 0,
                },
                workflowRunId: 'wfr_p6vm8hS1wthVJXcoQb7xp',
              },
            },
            {
              description: 'Cancels a user subscription',
              path: '/subscriptions/{id}/cancel',
              method: 'PUT',
              authenticated: true,
              request: {
                pathParams: [
                  {
                    name: 'id',
                    type: 'string',
                    required: true,
                    description: 'The Subscription Id',
                  },
                ],
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                message: 'Subscription cancelled successfully',
                data: {
                  _id: '68fe6fe8c53230ac33c923c7',
                  name: 'Only Fans',
                  price: 20,
                  currency: 'ETB',
                  frequency: 'weekly',
                  category: 'finance',
                  paymentMethod: 'new',
                  status: 'cancelled',
                  startDate: '2025-10-25T01:17:00.000Z',
                  user: '68fe6f62c53230ac33c923c2',
                  createdAt: '2025-10-26T19:00:56.654Z',
                  updatedAt: '2026-02-21T11:20:39.686Z',
                  renewalDate: '2025-11-01T01:17:00.000Z',
                  __v: 0,
                },
              },
            },
            {
              description: 'Updates a user subscription',
              path: '/subscriptions/{id}',
              method: 'PUT',
              authenticated: true,
              request: {
                pathParams: [
                  {
                    name: 'id',
                    type: 'string',
                    required: true,
                    description: 'The Subscription Id',
                  },
                ],
                headers: null,
                body: [
                  {
                    name: 'name',
                    type: 'string',
                    required: false,
                    description: 'The Subscription Name',
                  },
                  {
                    name: 'frequency',
                    type: 'string',
                    required: true,
                    enum: ['daily', 'weekly', 'monthly', 'yearly'],
                    description: 'The Subscription Frequency',
                  },
                  {
                    name: 'currency',
                    type: 'string',
                    required: false,
                    enum: ['USD', 'ETB'],
                    description: 'The Payment Currency',
                  },
                  {
                    name: 'category',
                    type: 'string',
                    required: true,
                    enum: [
                      'sports',
                      'news',
                      'politics',
                      'entertainment',
                      'lifestyle',
                      'technology',
                      'finance',
                      'other',
                    ],
                    description: 'The Subscription Category',
                  },
                  {
                    name: 'price',
                    type: 'number',
                    required: true,
                    description: 'The Subscription Price',
                  },
                ],
              },
              responseSample: {
                success: true,
                data: {
                  _id: '698c7e014b15387eda7fd207',
                  name: 'Only Tribe',
                  price: 100,
                  currency: 'USD',
                  frequency: 'daily',
                  category: 'politics',
                  paymentMethod: 'card',
                  status: 'active',
                  startDate: '2026-02-10T13:55:51.316Z',
                  user: '698c7dcb4b15387eda7fd204',
                  createdAt: '2026-02-11T13:02:57.291Z',
                  updatedAt: '2026-02-12T11:42:38.105Z',
                  renewalDate: '2026-02-11T13:55:51.316Z',
                  __v: 0,
                },
              },
            },
          ],
        },
        {
          groupName: 'Users',
          endpoints: [
            {
              description: 'Fetches all users',
              path: '/users',
              method: 'GET',
              authenticated: true,
              request: {
                pathParams: null,
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                data: [
                  {
                    _id: '4582981854920348548234',
                    name: 'brah',
                    email: 'b@b.b',
                    createdAt: '2025-09-23T20:38:01.442Z',
                    updatedAt: '2025-09-23T20:38:01.442Z',
                    __v: 0,
                  },
                  {
                    _id: '4582981854920348548234',
                    name: 'brah',
                    email: 'g@g.gg',
                    createdAt: '2025-09-26T12:53:50.286Z',
                    updatedAt: '2025-09-26T12:53:50.286Z',
                    __v: 0,
                  },
                ],
              },
            },
            {
              description: 'Fetches a specific user',
              path: '/users/{id}',
              method: 'GET',
              authenticated: true,
              request: {
                pathParams: [
                  {
                    name: 'id',
                    type: 'string',
                    required: true,
                    description: 'The Subscription Id',
                  },
                ],
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                data: {
                  _id: '698c7e014b15387eda7fd207',
                  name: 'Only Tribe',
                  price: 100,
                  currency: 'USD',
                  frequency: 'daily',
                  category: 'politics',
                  paymentMethod: 'card',
                  status: 'active',
                  startDate: '2026-02-10T13:55:51.316Z',
                  user: '698c7dcb4b15387eda7fd204',
                  createdAt: '2026-02-11T13:02:57.291Z',
                  updatedAt: '2026-02-12T11:42:38.105Z',
                  renewalDate: '2026-02-11T13:55:51.316Z',
                  __v: 0,
                },
              },
            },
            {
              description: 'Fetches the current user',
              path: '/users/me',
              method: 'GET',
              authenticated: true,
              request: {
                pathParams: null,
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                data: {
                  _id: '68fe6f6df235kkd30ac33c923c2',
                  name: 'Steve',
                  email: 'bruh@mail.com',
                  createdAt: '2025-10-26T18:58:42.053Z',
                  updatedAt: '2025-10-26T18:58:42.053Z',
                  __v: 0,
                },
              },
            },
          ],
        },
      ],
      authentication: {
        type: 'Bearer',
        headerName: 'Authorization',
      },
    },
    {
      id: 'billing-api',
      name: 'Billing Service',
      isExampleApi: true,
      shortDescription: 'Invoice generation and payment tracking.',
      description:
        'The financial processing hub for the platform. This service handles the generation of invoices, real-time payment tracking, and automated refund processing. It bridges the gap between active subscriptions and ledger entries, ensuring all transactions are compliant and recorded for audit purposes.',
      version: '1.0',
      icon: 'HandCoins',
      baseUrl: 'https://billing-service.example.com/api/v1',
      rateLimit: {
        limit: 30,
        window: 'minute',
      },
      resources: [
        {
          groupName: 'Authentication',
          endpoints: [
            {
              description: 'User Authentication',
              path: '/auth/login',
              method: 'POST',
              authenticated: false,
              isLogin: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'User email address',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'User password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Authentication successful',
                data: {
                  token: 'jwt_token_here',
                },
              },
            },
            {
              description: 'Register New User',
              path: '/auth/register',
              method: 'POST',
              authenticated: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'username',
                    type: 'string',
                    required: true,
                    description: 'Unique username',
                  },
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'User email',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'Secure password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Account registered successfully',
                data: {
                  user: {
                    id: '123',
                    name: 'John',
                    email: 'john@example.com',
                    createdAt: '2026-02-18T10:47:07.403Z',
                    updatedAt: '2026-02-18T10:47:07.403Z',
                  },
                  token: 'jwt_token',
                },
              },
            },
          ],
        },
        {
          groupName: 'Invoices',
          endpoints: [
            {
              description: 'List Invoices',
              path: '/invoices',
              method: 'GET',
              authenticated: true,
              request: {
                queryParams: [
                  {
                    name: 'status',
                    description: 'Filter by invoice status (e.g., paid, pending, void)',
                    required: false,
                    enum: ['paid', 'pending', 'void'],
                    type: 'string',
                  },
                  {
                    name: 'customerId',
                    description: 'Filter by specific customer identifier',
                    required: false,
                    type: 'string',
                  },
                ],
                pathParams: null,
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                data: [
                  {
                    id: 'inv_123',
                    customerId: 'cus_456',
                    amount: 9900,
                    currency: 'USD',
                    status: 'paid',
                    createdAt: '2026-02-10T10:00:00.000Z',
                  },
                ],
              },
            },
            {
              description: 'Create Invoice',
              path: '/invoices',
              method: 'POST',
              authenticated: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: null,
                body: [
                  {
                    name: 'customerId',
                    type: 'string',
                    required: true,
                    description: 'The customer identifier',
                  },
                  {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'Invoice amount in minor units (e.g., cents)',
                  },
                  {
                    name: 'currency',
                    type: 'string',
                    required: true,
                    enum: ['USD', 'EUR'],
                    description: 'Currency code',
                  },
                ],
              },
              responseSample: {
                success: true,
                data: {
                  id: 'inv_789',
                  customerId: 'cus_456',
                  amount: 9900,
                  currency: 'USD',
                  status: 'pending',
                  createdAt: '2026-02-13T09:30:00.000Z',
                },
              },
            },
          ],
        },
      ],
      authentication: {
        type: 'Bearer',
        headerName: 'Authorization',
      },
    },
    {
      id: 'notification-api',
      isExampleApi: true,
      name: 'Notification Center',
      shortDescription: 'Templated multi-channel notifications (email/SMS).',
      description:
        'A centralized gateway for multi-channel user communication. It abstracts the complexity of SMTP and SMS providers, allowing for templated notifications that support dynamic variable injection. It ensures that critical alerts, like renewal reminders or payment failures, reach users via their preferred channels.',
      version: '1.0',
      icon: 'BellRing',
      baseUrl: 'https://notification-center.example.com/api/v1',
      rateLimit: {
        limit: 1000,
        window: 'hour',
      },
      resources: [
        {
          groupName: 'Authentication',
          endpoints: [
            {
              description: 'Sign In',
              path: '/signin',
              method: 'POST',
              authenticated: false,
              isLogin: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'Email for login',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'Account password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Signed in',
                data: {
                  token: 'jwt_token_here',
                },
              },
            },
            {
              description: 'Create Account',
              path: '/signup',
              method: 'POST',
              authenticated: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: 'Full name',
                  },
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'Email address',
                  },
                  {
                    name: 'phone',
                    type: 'string',
                    required: false,
                    description: 'Phone number',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'Password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Registration complete',
                data: {
                  user: {
                    id: '456',
                    name: 'Jane',
                    email: 'jane@example.com',
                    createdAt: '2026-02-18T10:47:07.403Z',
                    updatedAt: '2026-02-18T10:47:07.403Z',
                  },
                  token: 'jwt_token',
                },
              },
            },
          ],
        },
        {
          groupName: 'Notifications',
          endpoints: [
            {
              description: 'Send Email Notification',
              path: '/notifications/email',
              method: 'POST',
              authenticated: true,
              request: {
                queryParams: [
                  {
                    name: 'priority',
                    description: 'Email priority level',
                    required: false,
                    enum: ['low', 'normal', 'high'],
                    type: 'string',
                  },
                ],
                pathParams: null,
                headers: null,
                body: [
                  {
                    name: 'to',
                    type: 'string',
                    required: true,
                    description: 'Recipient email address',
                  },
                  {
                    name: 'subject',
                    type: 'string',
                    required: true,
                    description: 'Email subject',
                  },
                  {
                    name: 'templateId',
                    type: 'string',
                    required: false,
                    description: 'Template identifier to render',
                  },
                  {
                    name: 'variables',
                    type: 'string',
                    required: false,
                    description: 'Key-value pairs for template variables',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'email queued',
                data: { notificationId: 'ntf_123', channel: 'email', status: 'queued' },
              },
            },
            {
              description: 'Send SMS Notification',
              path: '/notifications/sms',
              method: 'POST',
              authenticated: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: null,
                body: [
                  {
                    name: 'to',
                    type: 'string',
                    required: true,
                    description: 'Recipient phone number in E.164 format',
                  },
                  {
                    name: 'message',
                    type: 'string',
                    required: true,
                    description: 'Text message content',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'sms queued',
                data: { notificationId: 'ntf_456', channel: 'sms', status: 'queued' },
              },
            },
          ],
        },
      ],
      authentication: {
        type: 'API_KEY',
        headerName: 'X-Api-Key',
      },
    },
    {
      id: 'analytics-api',
      isExampleApi: true,
      name: 'Event Analytics',
      shortDescription: 'High-throughput event ingestion and querying.',
      description:
        'An event-driven data ingestion and querying engine. This service captures granular user interactions and system events, providing a high-throughput path for real-time tracking. It allows developers and data analysts to query historical trends to optimize user retention and platform performance.',
      version: '1.0',
      icon: 'ChartSpline',
      baseUrl: 'https://analytics.example.com/api/v1',
      rateLimit: {
        limit: 10000,
        window: 'day',
      },
      resources: [
        {
          groupName: 'Authentication',
          endpoints: [
            {
              description: 'Login',
              path: '/auth/signin',
              method: 'POST',
              authenticated: false,
              isLogin: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: "User's email",
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: "User's password",
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Login successful',
                data: {
                  token: 'jwt_token_here',
                },
              },
            },
            {
              description: 'Sign Up',
              path: '/auth/signup',
              method: 'POST',
              authenticated: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: 'User full name',
                  },
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'User email',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'Chosen password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'User account created',
                data: {
                  user: {
                    id: '789',
                    name: 'Alex',
                    email: 'alex@example.com',
                    createdAt: '2026-02-18T10:47:07.403Z',
                    updatedAt: '2026-02-18T10:47:07.403Z',
                  },
                  token: 'jwt_token',
                },
              },
            },
          ],
        },
        {
          groupName: 'Events',
          endpoints: [
            {
              description: 'Ingest Event',
              path: '/events',
              method: 'POST',
              authenticated: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: null,
                body: [
                  {
                    name: 'type',
                    type: 'string',
                    required: true,
                    description: 'The event type identifier (e.g., page_view)',
                  },
                  {
                    name: 'userId',
                    type: 'string',
                    required: false,
                    description: 'The user identifier',
                  },
                  {
                    name: 'properties',
                    type: 'string',
                    required: false,
                    description: 'Additional event properties/metadata',
                  },
                  {
                    name: 'timestamp',
                    type: 'string',
                    required: false,
                    description: 'ISO8601 timestamp; defaults to now',
                  },
                ],
              },
              responseSample: {
                success: true,
                data: { eventId: 'evt_123', receivedAt: '2026-02-13T09:45:00.000Z' },
              },
            },
            {
              description: 'Query Events',
              path: '/events',
              method: 'GET',
              authenticated: true,
              request: {
                queryParams: [
                  {
                    name: 'type',
                    description: 'Filter by event type',
                    required: false,
                    type: 'string',
                  },
                  {
                    name: 'from',
                    description: 'Start of time range (ISO8601)',
                    required: false,
                    type: 'string',
                  },
                  {
                    name: 'to',
                    description: 'End of time range (ISO8601)',
                    required: false,
                    type: 'string',
                  },
                ],
                pathParams: null,
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                data: [
                  {
                    id: 'evt_123',
                    type: 'page_view',
                    userId: 'user_1',
                    properties: { path: '/pricing' },
                    timestamp: '2026-02-13T09:45:00.000Z',
                  },
                ],
              },
            },
          ],
        },
      ],
      authentication: {
        type: 'Bearer',
        headerName: 'Authorization',
      },
    },
    {
      id: 'user-profile-api',
      isExampleApi: true,
      name: 'User Profile Service',
      shortDescription: 'Identity, profiles, and personalization.',
      description:
        'The identity and personalization engine for the platform. It manages deep profile data, user-specific UI preferences, and localization settings. Additionally, it stores compliance-related data such as marketing consent and language settings to ensure personalized user experiences.',
      version: '1.0',
      baseUrl: 'https://user-profile.example.com/api/v1',
      rateLimit: {
        limit: 500,
        window: 'hour',
      },
      resources: [
        {
          groupName: 'Authentication',
          endpoints: [
            {
              description: 'Authenticate User',
              path: '/login',
              method: 'POST',
              authenticated: false,
              isLogin: true,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'Login email',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'Login password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Welcome back',
                data: {
                  token: 'jwt_token_here',
                },
              },
            },
            {
              description: 'User Registration',
              path: '/register',
              method: 'POST',
              authenticated: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: 'Authorization',
                body: [
                  {
                    name: 'name',
                    type: 'string',
                    required: true,
                    description: 'Display name',
                  },
                  {
                    name: 'email',
                    type: 'string',
                    required: true,
                    description: 'Contact email',
                  },
                  {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'Account password',
                  },
                ],
              },
              responseSample: {
                success: true,
                message: 'Profile created',
                data: {
                  user: {
                    id: '101',
                    name: 'Sam',
                    email: 'sam@example.com',
                    createdAt: '2026-02-18T10:47:07.403Z',
                    updatedAt: '2026-02-18T10:47:07.403Z',
                  },
                  token: 'jwt_token',
                },
              },
            },
          ],
        },
        {
          groupName: 'Profiles',
          endpoints: [
            {
              description: 'Get User Profile',
              path: '/profiles/{id}',
              method: 'GET',
              authenticated: true,
              request: {
                queryParams: [
                  {
                    name: 'include',
                    description: 'Fields to include in the response',
                    required: false,
                    type: 'string',
                  },
                ],
                pathParams: [
                  {
                    name: 'id',
                    type: 'string',
                    required: true,
                    description: 'The user ID',
                  },
                ],
                headers: null,
                body: null,
              },
              responseSample: {
                success: true,
                data: {
                  id: 'user_1',
                  email: 'user@example.com',
                  name: 'Jane Doe',
                  timezone: 'UTC',
                  createdAt: '2026-01-01T12:00:00.000Z',
                },
              },
            },
            {
              description: 'Update User Preferences',
              path: '/profiles/{id}/preferences',
              method: 'PATCH',
              authenticated: true,
              request: {
                queryParams: null,
                pathParams: [
                  {
                    name: 'id',
                    type: 'string',
                    required: true,
                    description: 'The user ID',
                  },
                ],
                headers: null,
                body: [
                  {
                    name: 'language',
                    type: 'string',
                    required: false,
                    description: 'Preferred language (ISO code)',
                  },
                  {
                    name: 'theme',
                    type: 'string',
                    required: false,
                    enum: ['light', 'dark', 'system'],
                    description: 'UI theme preference',
                  },
                  {
                    name: 'marketingOptIn',
                    type: 'boolean',
                    required: false,
                    description: 'Whether the user consents to marketing emails',
                  },
                ],
              },
              responseSample: {
                success: true,
                data: {
                  id: 'user_1',
                  language: 'en',
                  theme: 'dark',
                  marketingOptIn: true,
                },
              },
            },
          ],
        },
      ],
      authentication: {
        type: 'Bearer',
        headerName: 'Authorization',
      },
    },
    {
      id: 'bank-co-api',
      name: 'Bank Co Game Coordinator',
      shortDescription: "Handles matchmaking and game state for Bank Co's online game.",
      description:
        "The real-time game coordinator for Bank Co's online multiplayer game. It manages player matchmaking, game state synchronization, and turn-based logic. This API serves as the backbone for the game's online experience, ensuring smooth gameplay and real-time updates for players.",
      version: '1.0',
      icon: 'Gamepad2',
      baseUrl: 'https://bank-co-coordinator.vercel.app/api/v1',
      rateLimit: {
        limit: 15,
        window: 'minute',
      },
      resources: [
        {
          groupName: 'Matchmaking',
          endpoints: [
            {
              description: 'Find Match',
              path: '/tables/find-match',
              method: 'POST',
              authenticated: false,
              isLogin: false,
              request: {
                queryParams: null,
                pathParams: null,
                headers: null,
                body: [
                  {
                    name: 'playerName',
                    type: 'string',
                    required: true,
                    description: 'The Player Name',
                  },
                ],
              },
              responseSample: {
                data: {
                  tableId: 'tbl-OsX0Kxvr2K6xi3qk3ez',
                  status: 'waiting',
                  createdAt: 1778687235506,
                  updatedAt: 1778687235506,
                  roundContributions: 200,
                  pot: 0,
                  currentRound: 0,
                  currentTurn: null,
                  phase: 'waiting',
                  _meta: {
                    totalPlayers: 1,
                    maxPlayers: 4,
                  },
                  players: {
                    'plr-OsX0KxwGC525OcOwhXL': {
                      uid: 'plr-OsX0KxwGC525OcOwhXL',
                      displayName: 'Satenaw',
                      seat: 0,
                      chips: 1000,
                      isEliminated: false,
                      betAmount: null,
                      decision: null,
                      lastActionAt: null,
                      hand: null,
                      wonLastRound: null,
                      lostLastRound: null,
                    },
                  },
                  roundHistory: {},
                  playerData: {
                    uid: 'plr-OsX0KxwGC525OcOwhXL',
                    displayName: 'Satenaw',
                    seat: 0,
                    chips: 1000,
                    isEliminated: false,
                    betAmount: null,
                    decision: null,
                    lastActionAt: null,
                    hand: null,
                    wonLastRound: null,
                    lostLastRound: null,
                  },
                },
                success: true,
                message: 'Match Found',
              },
            },
          ],
        },
      ],
      authentication: {
        type: 'Bearer',
        headerName: 'Authorization',
      },
    },
  ],
} satisfies { apis: ApiDefinition[] };

export default registry;
