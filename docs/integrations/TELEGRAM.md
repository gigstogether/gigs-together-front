# Telegram integration

Complete the
[shared Telegram setup](https://github.com/gigstogether/gigs-together-api/blob/main/docs/integrations/TELEGRAM.md#shared-setup)
for BotFather, Mini Apps, Web Login, and the shared `startapp` contract. Backend configuration is in the same guide.

Set the frontend environment variables according to the [environment reference](../configuration/ENVIRONMENT.md).

For local HTTPS access, follow the [frontend Cloudflare Tunnel guide](../development/CLOUDFLARE_TUNNEL.md).

## Checks

- Both named Mini App links open the configured frontend entry points.
- Suggestion buttons work in private and shared chats.
- Browser sign-in succeeds on the allowed frontend origin.
- A generated moderation action link opens the correct Gig or GigCandidate page for an application moderator.
