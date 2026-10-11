import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	loadOriginal,
	MAX_ORIGINAL_BYTES,
} from '../../src/tools/artnuvio/original';

afterEach(() => vi.unstubAllGlobals());

describe('local Originals', () => {
	it('rejects wrong types and oversized files before decoding', async () => {
		const decode = vi.fn();
		vi.stubGlobal('createImageBitmap', decode);
		await expect(
			loadOriginal(new Blob(['text'], { type: 'text/plain' }), {
				kind: 'paste',
			})
		).rejects.toThrow("That isn't an image");
		await expect(
			loadOriginal(
				{ type: 'image/png', size: MAX_ORIGINAL_BYTES + 1 } as Blob,
				{ kind: 'paste' }
			)
		).rejects.toThrow('That image is over 25 MB');
		expect(decode).not.toHaveBeenCalled();
	});
	it('accepts the exact limit and preserves natural size and file origin', async () => {
		const bitmap = { width: 1200, height: 800, close: vi.fn() };
		vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
		const source = { kind: 'file' as const, fileName: 'art.png' };
		expect(
			await loadOriginal(
				{ type: 'image/png', size: MAX_ORIGINAL_BYTES } as Blob,
				source
			)
		).toEqual({ bitmap, width: 1200, height: 800, source });
	});
	it('reports decoding errors', async () => {
		vi.stubGlobal(
			'createImageBitmap',
			vi.fn().mockRejectedValue(new Error('bad bytes'))
		);
		await expect(
			loadOriginal(new Blob([], { type: 'image/png' }), { kind: 'paste' })
		).rejects.toThrow("That image couldn't be decoded");
	});
	it.each([
		[0, 100],
		[100, 0],
		[NaN, 100],
		[100, Infinity],
		[-1, 100],
	])(
		'rejects invalid dimensions %s × %s and frees the bitmap',
		async (width, height) => {
			const bitmap = { width, height, close: vi.fn() };
			vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
			await expect(
				loadOriginal(new Blob([], { type: 'image/png' }), { kind: 'paste' })
			).rejects.toThrow('invalid dimensions');
			expect(bitmap.close).toHaveBeenCalledOnce();
		}
	);
});
