# DBots Guild Count 

Cron Worker to fetch guild count and send it to https://discord.bots.gg API.

## Setup

1. `nix-shell` (skip if you have node installed from another source, then use `npx wrangler` for below)
2. `npm install`
3. `wrangler secret put DBOTS_TOKEN`
4. `wrangler secret put TOKENS` - this should map bot IDs to Discord tokens and be of the form `{"12345": "tokenhere"}`.
5. `wrangler kv:namespace create KV` and update the `wrangler.toml` entry with the new ID.
6. Optional: `wrangler secret put HTTPSECRET` - this is used to authenticate manual invocations over HTTP, useful for testing in production.
7. `wrangler deploy`
