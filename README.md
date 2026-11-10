# Devosoft lead survey + Kommo

React + TypeScript + Vite frontend and a small Node.js API. The browser sends the survey to the same-origin API; only the Node server communicates with Kommo. Kommo credentials must never be placed in frontend variables or committed to Git.

## Kommo setup

1. In Kommo, create a **private integration** with permission to add leads and contacts. Enable its **Duplicate control** option if you want Kommo to merge duplicate submissions according to the account's duplicate rules.
2. Generate a long-lived token for that integration. Do not send it in chat or commit it to the repository.
3. Configure the Node server environment:

   ```env
   KOMMO_BASE_URL=https://qodiraliyevshohjaxon2005.amocrm.ru
   KOMMO_ACCESS_TOKEN=your_private_integration_token
   ALLOWED_ORIGINS=https://devosoft-landing.devosoft.uz
   PORT=3000
   ```

   `KOMMO_BASE_URL` is the account-specific API host. The server accepts HTTPS account hosts under `*.amocrm.ru` or `*.kommo.com`; it is configurable at deploy time.

4. The integration creates a Kommo lead and a linked contact with the lead's phone number, then adds a text note to the lead with survey answers, language, page URL, and UTM attribution. No Kommo custom field IDs are required.

The long-lived token is a powerful private-integration credential. Store it only in the hosting provider's server environment/secrets or an untracked server-side `.env` file. Never use `VITE_KOMMO_ACCESS_TOKEN`; all `VITE_` variables are public in the browser bundle.

## Local development

```bash
npm ci
npm run dev
```

The Vite development server proxies the lead endpoint to the Node API on port 3000. Copy `.env.example` to `.env`, set the Kommo account URL and token, then run `npm start` in a second terminal. The Vite API URL defaults to `/api/lead`, so frontend and API requests stay same-origin through the development proxy.

## GitHub build and server deploy

Push the project to the `main` or `master` branch. GitHub Actions runs tests and the production build, then uploads a `devosoft-survey-dist` artifact containing `dist/`, `server/`, and the package manifests.

The target host must support a persistent **Node.js 22.9+** process. Download and extract the artifact to the app directory (keep `dist/` and `server/` beside `package.json`), configure the environment variables above in the hosting control panel, install the production dependencies with `npm ci --omit=dev`, and set the application start command to `npm start`. Configure the app's public URL/subdomain to proxy to the Node process and set `ALLOWED_ORIGINS` to the exact HTTPS website origin.

If the hosting panel requires building from source instead of using the artifact, deploy the repository and run:

```bash
npm ci
npm run build
npm start
```

`public/.htaccess` is provided for static Apache hosting, but static-only hosting cannot run the Kommo API. Do not expose `/api/lead` to the public internet through a static-only deployment without the Node service.

## API behavior and protection

- `POST /api/lead` validates the request, checks its `Origin`, enforces a small in-memory per-IP rate limit, and rejects oversized or honeypot-filled payloads.
- `GET /healthz` is a basic process health check.
- Kommo tokens and upstream error bodies are never returned to the browser or written to application logs.
- If Kommo creates the lead but adding its answer note fails, the API reports that specific state so the user is warned not to submit a duplicate lead.
- The in-memory rate limit is per Node process. For multiple processes/instances, add a shared rate limiter at the hosting proxy or a shared store.

## Commands

```bash
npm run test
npm run build
npm run lint
```

## Official Kommo documentation

- [Private integrations](https://developers.kommo.com/docs/private-integration)
- [Long-lived tokens](https://developers.kommo.com/docs/long-lived-token)
- [Complex addition of a lead with a contact](https://developers.kommo.com/reference/complex-leads)
- [Add notes](https://developers.kommo.com/reference/add-notes)
- [Note types](https://developers.kommo.com/reference/notes-types)
