# Swagster Docs

Swagster is a browser-based API documentation and testing workspace. Browse a curated catalog of REST APIs, inspect endpoint details and example responses, provide request parameters, and send requests directly from the documentation UI.

## Features

- Search and browse APIs from a built-in registry.
- Explore endpoint methods, paths, authentication requirements, parameters, and example responses.
- Build requests from endpoint forms and inspect the response, status, and execution time.
- Generate equivalent cURL commands for requests.
- Configure bearer-token or API-key authentication when an API requires it.
- Copy API URLs, endpoint paths, and generated request details.

## Technology stack

Versions are the dependency specifications listed in `package.json`.

[![Vite](https://img.shields.io/badge/Vite-%5E7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-%5E19.2.0-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%7E5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%5E4.1.18-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-%5E7.13.0-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-%5E1.13.5-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Zod](https://img.shields.io/badge/Zod-%5E4.3.6-3E67B1?style=for-the-badge)](https://zod.dev/)

## Requirements

- [Bun](https://bun.sh/) (the repository includes `bun.lock`) or Node.js with npm.
- A modern browser. API calls run from the browser, so a target API must allow cross-origin requests (CORS) from the app's origin.

## Getting started

1. Install dependencies:

   ```bash
   bun install
   ```

   Or use `npm install`.

2. Start the development server:

   ```bash
   bun dev
   ```

3. Open the local URL printed by Vite (usually [http://localhost:5173](http://localhost:5173)). Select **View Collection**, search for an API, and open its documentation.

No environment variables are currently required. The included [`.env.example`](.env.example) records this explicitly; copy it only if you want a starting point for adding environment configuration later.

## Available scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the Vite development server. |
| `bun run build` | Type-check and build the production app. |
| `bun run preview` | Preview the production build locally. |
| `bun run lint` | Run ESLint. |
| `bun run format` | Format files with Prettier. |

With npm, use `npm run <script>` for each script.

## Using the API explorer

1. Choose an API from the catalog or use the search dialog.
2. Review the API base URL, available endpoint groups, parameters, and example responses.
3. Select an endpoint and fill any required path, query, or body fields.
4. If authentication is required, provide credentials using the API's configured login flow or token entry.
5. Send the request and inspect the response or generated cURL example.

Requests are sent directly by the browser to each API's configured base URL. The target service controls whether those requests are accepted and whether browser CORS rules allow them.

## API registry

The API catalog and endpoint definitions live in `src/api-data/registry.ts`. Each entry describes an API's base URL, authentication, rate limits, endpoint groups, request fields, and sample responses. Add or update registry entries there to change the catalog displayed in the app.

## Project structure

```text
src/
|-- api-data/       # API catalog and endpoint definitions
|-- components/     # Shared UI, endpoint forms, and dialogs
|-- lib/            # HTTP client, icons, and helpers
|-- pages/           # Home, API documentation, and about pages
|-- models/          # API and endpoint TypeScript types
|-- App.tsx          # Client-side routes
`-- main.tsx         # React application entry point
```

## Deployment

Build the app with `bun run build` and deploy the generated `dist/` directory to a static hosting provider. Configure SPA fallback/rewrite behavior so routes such as `/api/docs/<id>` serve `index.html`. The repository includes a `vercel.json` for Vercel deployments.

## Security and credentials

Authentication tokens entered in the app are stored in browser `localStorage` for each API. Use this tool only in a trusted browser session, and avoid using real production credentials on shared or public devices. Do not add private credentials to the public API registry or commit them to the repository.
