# Local frontend HTTPS access with Cloudflare Tunnel

Expose the local frontend over HTTPS for browser and Telegram Mini App testing. This guide adds the frontend route; the
API can run locally or remotely.

## Tunnel setup

For installation, tunnel creation, local `config.yml` setup, and updates, see the
[backend tunnel guide](https://github.com/gigstogether/gigs-together-api/blob/main/docs/development/CLOUDFLARE_TUNNEL.md).
Reuse the same developer tunnel if it already exists; only the frontend route is required for this guide.

Choose an unused frontend hostname, for example `alice.gigstogether.com`, and create its DNS route in the same account
(requires DNS permissions). Skip this command if the route is already configured:

```text
cloudflared tunnel route dns <tunnel-name> <frontend-hostname>
```

## Frontend configuration

Add this rule to `ingress` in your `config.yml`, before the single final `http_status:404` rule. Keep the existing
tunnel settings and other routes:

```yaml
- hostname: <frontend-hostname>
  service: http://localhost:3001
```

The hostname must not include a protocol or port.

In this repository's `.env`, replace the placeholders and set:

```env
NEXT_PUBLIC_APP_API_BASE_URL=<api-base-url>
NEXT_PUBLIC_APP_BASE_URL=https://<frontend-hostname>
ALLOWED_DEV_ORIGINS=<frontend-hostname>
```

`<api-base-url>` must be reachable from the frontend server and browser, including a phone or Telegram WebView. Use an
HTTPS API URL for this HTTPS frontend; the API must allow requests from `https://<frontend-hostname>`. Restart the
frontend after changing these values.

## Run

Start the frontend:

```text
npm run dev -- --port 3001
```

Start the tunnel once in another terminal:

```text
cloudflared tunnel run <tunnel-name>
```

Open `https://<frontend-hostname>`. Keep the tunnel terminal open; stop the tunnel with `Ctrl+C`. If the tunnel is
already running for another application, restart it after editing `config.yml` instead of starting a second instance.

For Telegram testing, use your frontend URL in the [Mini App setup](../integrations/TELEGRAM.md).
