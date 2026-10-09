import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { buildManifest } from '@/tools/listio/addon/manifest.ts';
import {
	addonNotFound,
	addonResponse,
	validSecret,
} from '@/tools/listio/addon/http.ts';
import { resolveAddonId } from '@/tools/listio/domain/addonId.ts';
import { getIndex } from '@/tools/listio/storage/lists.ts';

export const GET: APIRoute = async ({ params }) => {
	if (!validSecret(params.secret, env.ADDON_SECRET)) return addonNotFound();
	return addonResponse(
		buildManifest(await getIndex(env.LISTIO), resolveAddonId(env.ADDON_ID))
	);
};
