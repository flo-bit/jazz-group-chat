import { AtpBaseClient } from '@atproto/api';

let agent: AtpBaseClient | null = null;

export async function getProfile({ did }: { did: string }) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://public.api.bsky.app' });
	}

	const data = await agent.app.bsky.actor.getProfile({ actor: did });
	return data.data;
}

export async function resolveHandle({ handle }: { handle: string }) {
	if (!agent) {
		agent = new AtpBaseClient({ service: 'https://public.api.bsky.app' });
	}

	const data = await agent.com.atproto.identity.resolveHandle({ handle });
	return data.data.did;
}
