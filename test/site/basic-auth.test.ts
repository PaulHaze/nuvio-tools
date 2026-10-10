import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

const fakeEnv: Record<string, string | undefined> = {};

vi.mock('cloudflare:workers', () => ({ env: fakeEnv }));

const { onRequest } = await import('../../src/middleware.ts');

const passed = new Response('ok');

function call(path: string, authorization?: string): Promise<Response> {
	const url = new URL(`https://listio.example${path}`);
	const headers = authorization ? { Authorization: authorization } : undefined;
	const context = { url, request: new Request(url, { headers }) };
	return onRequest(
		context as unknown as APIContext,
		async () => passed
	) as Promise<Response>;
}

const basic = (user: string, password: string) =>
	`Basic ${btoa(`${user}:${password}`)}`;

beforeEach(() => {
	fakeEnv.ADMIN_USER = 'paul';
	fakeEnv.ADMIN_PASSWORD = 'correct horse';
});

describe('basic auth middleware', () => {
	it('challenges Listio pages and API without credentials', async () => {
		for (const path of [
			'/listio',
			'/listio/',
			'/listio/import',
			'/listio/lists/abc',
			'/listio/api/lists',
		]) {
			const res = await call(path);
			expect(res.status).toBe(401);
			expect(res.headers.get('WWW-Authenticate')).toMatch(/^Basic /);
		}
	});

	it('uses the Nuvio Tools realm', async () => {
		const res = await call('/listio');
		expect(res.headers.get('WWW-Authenticate')).toBe(
			'Basic realm="Nuvio Tools", charset="UTF-8"'
		);
	});

	it('lets the right credentials through', async () => {
		expect(
			await call('/listio/api/lists', basic('paul', 'correct horse'))
		).toBe(passed);
		expect(await call('/listio', basic('paul', 'correct horse'))).toBe(passed);
	});

	it('rejects a wrong password or user, and malformed headers', async () => {
		expect((await call('/listio', basic('paul', 'wrong'))).status).toBe(401);
		expect(
			(await call('/listio', basic('someone', 'correct horse'))).status
		).toBe(401);
		expect((await call('/listio', 'Basic !!!not-base64')).status).toBe(401);
		expect((await call('/listio', 'Bearer token')).status).toBe(401);
	});

	it('leaves the addon and robots.txt open', async () => {
		expect(await call('/listio/addon/secret/manifest.json')).toBe(passed);
		expect(await call('/listio/addon/secret/catalog/movie/list.json')).toBe(
			passed
		);
		expect(await call('/robots.txt')).toBe(passed);
	});

	it('leaves Home, ArtNuvio and Collectio open', async () => {
		for (const path of ['/', '/artnuvio', '/collectio', '/listiox', '/404']) {
			expect(await call(path)).toBe(passed);
		}
	});

	it('protects encoded, upper-case and double-slash variants of /listio', async () => {
		for (const path of [
			'/listi%6F',
			'/listio%2Fapi/lists',
			'/LISTIO',
			'//listio',
			'/listio/addon%2F..%2Fapi/lists',
			'/listio/%E0%A4%A',
		]) {
			expect((await call(path)).status).toBe(401);
		}
	});

	it('does not let look-alike paths through the public rules', async () => {
		expect((await call('/listio/addonx')).status).toBe(401);
		expect((await call('/listio/addon')).status).toBe(401);
	});

	it('fails closed when credentials are not configured', async () => {
		fakeEnv.ADMIN_PASSWORD = '';
		expect((await call('/listio', basic('paul', ''))).status).toBe(503);
		expect((await call('/listio/api/lists')).status).toBe(503);
	});
});
