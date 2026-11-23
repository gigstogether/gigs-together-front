# Local HTTPS access with Cloudflare Tunnel

This tunnel provides public HTTPS access to the locally running API and frontend, including Telegram bot webhook handling and Mini App development.

Use your own tunnel and two subdomains: `<frontend-hostname>` routes to this frontend on port `3001`, and `<api-hostname>` routes to the backend on port `3000`.

Replace the hostname placeholders and set these values in this repository's `.env` alongside any other required configuration:

```env
NEXT_PUBLIC_APP_API_BASE_URL=https://<api-hostname>
NEXT_PUBLIC_APP_BASE_URL=https://<frontend-hostname>
ALLOWED_DEV_ORIGINS=<frontend-hostname>
```

Restart the frontend after changing these values. The backend needs `CORS_ORIGINS` and `APP_BASE_URL` set to `https://<frontend-hostname>`.

Run the frontend on port `3001`:

```bash
npm run dev -- --port 3001
```

With the backend running on port `3000`, start the configured tunnel in another terminal using the name chosen during creation:

```text
cloudflared tunnel run <tunnel-name>
```

Open `https://<frontend-hostname>`. Keep the terminals open; stop the tunnel with `Ctrl+C`.
See the [tunnel setup guide](https://github.com/gigstogether/gigs-together-api/blob/main/docs/development/CLOUDFLARE_TUNNEL.md) for installation, tunnel creation, local configuration, and development bot setup.
