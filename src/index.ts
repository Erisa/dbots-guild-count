export interface Env {
	DBOTS_TOKEN: string;
	TOKENS: string;
	KV: KVNamespace;
	HTTPSECRET: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleDirectRequest(request, ctx, env);
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(handleRequest(ctx, env));
	},
};

async function handleDirectRequest(request: Request, ctx: ExecutionContext, env: Env) {
	if (request.headers.get('Authorization') !== env.HTTPSECRET) {
		return new Response('Unauthorized', { status: 401 });
	} else {
		return await handleRequest(ctx, env);
	}
}

async function handleRequest(ctx: ExecutionContext, env: Env) {
	let guildcounts: Dictionary<Number> = {};
	const tokenStore: Dictionary<string> = JSON.parse(env.TOKENS);

	for (const key in tokenStore) {
		const userAgent = `dbots-guild-count/1.0 (Workers+https://github.com/Erisa/dbots-guild-count) DBots/${key}`
		let resp = await fetch('https://discord.com/api/v10/applications/@me', {
			headers: {
				Authorization: 'Bot ' + tokenStore[key],
				'Content-Type': 'application/json',
				'User-Agent': userAgent
			},
		});
		if (resp.status === 200) {
			let json: { approximate_guild_count: number } = await resp.json();
			guildcounts[key] = json.approximate_guild_count;
			var oldCount = Number(await env.KV.get(key));

			if (oldCount != guildcounts[key]) {
				await env.KV.put(key, guildcounts[key].toString());
			}

			let dbotsResp = await fetch(`https://discord.bots.gg/api/v1/bots/${key}/stats`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: env.DBOTS_TOKEN,
					'User-Agent': userAgent
				},
				body: JSON.stringify({
					guildCount: guildcounts[key],
				}),
				method: 'POST',
			});

			if (dbotsResp.status != 200) {
				return dbotsResp;
			}
		}
	}
	return Response.json(guildcounts);
}

interface Dictionary<T> {
	[Key: string]: T;
}
