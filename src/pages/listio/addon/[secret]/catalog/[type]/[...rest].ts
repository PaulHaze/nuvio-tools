import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
	buildCatalog,
	parseCatalogPath,
} from '@/tools/listio/addon/catalog.ts';
import {
	addonNotFound,
	addonResponse,
	validSecret,
} from '@/tools/listio/addon/http.ts';
import { getList } from '@/tools/listio/storage/lists.ts';

export const GET: APIRoute = async ({ params }) => {
	if (!validSecret(params.secret, env.ADDON_SECRET)) return addonNotFound();
	const path = parseCatalogPath(params.rest);
	if (!path) return addonNotFound();
	// buildCatalog turns an unknown type into { metas: [] }.
	return addonResponse(
		buildCatalog(
			await getList(env.LISTIO, path.id),
			params.type ?? '',
			path.skip
		)
	);
};
