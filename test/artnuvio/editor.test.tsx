// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Editor from '../../src/tools/artnuvio/components/Editor';
import { FRAMES, FRAME_IDS } from '../../src/tools/artnuvio/frames';
import { placeMode } from '../../src/tools/artnuvio/framing';
import { drawPlacement } from '../../src/tools/artnuvio/drawPlacement';

vi.mock('../../src/tools/artnuvio/drawPlacement', () => ({
	drawPlacement: vi.fn(),
}));
let root: Root;
let host: HTMLDivElement;
let bitmap: { width: number; height: number; close: ReturnType<typeof vi.fn> };
let decode: ReturnType<typeof vi.fn>;

beforeEach(async () => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			disconnect() {}
		}
	);
	bitmap = { width: 1200, height: 800, close: vi.fn() };
	decode = vi.fn().mockResolvedValue(bitmap);
	vi.stubGlobal('createImageBitmap', decode);
	vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockReturnValue({
		width: 600,
		height: 400,
	} as DOMRect);
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
		{} as CanvasRenderingContext2D
	);
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	await act(async () => root.render(<Editor />));
});
afterEach(async () => {
	await act(async () => root.unmount());
	host.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

async function choose(
	file = new File(['image'], 'art.png', { type: 'image/png' })
) {
	const input = host.querySelector<HTMLInputElement>('input[type="file"]')!;
	Object.defineProperty(input, 'files', { configurable: true, value: [file] });
	await act(async () =>
		input.dispatchEvent(new Event('change', { bubbles: true }))
	);
}

function paste(target: EventTarget = document) {
	const event = new Event('paste', { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'clipboardData', {
		value: {
			items: [
				{
					kind: 'file',
					type: 'image/png',
					getAsFile: () =>
						new File(['image'], 'clipboard.png', { type: 'image/png' }),
				},
			],
		},
	});
	target.dispatchEvent(event);
	return event;
}

it('chooses an Original and redraws Cover in each Frame without distorting the preview', async () => {
	await choose();
	expect(host.textContent).toContain('art.png');
	expect(host.textContent).toContain('1200×800');
	for (const frame of FRAME_IDS) {
		await act(async () =>
			host
				.querySelector<HTMLInputElement>(
					`input[name="frame"][value="${frame}"]`
				)!
				.click()
		);
		const size = FRAMES[frame].sizes[0];
		expect(host.querySelector('.slot.cur .slot-stat')!.textContent).toBe(
			'Editing'
		);
		expect(drawPlacement).toHaveBeenLastCalledWith(
			expect.anything(),
			bitmap,
			size,
			placeMode(bitmap, size, 'cover'),
			expect.anything()
		);
		const canvas = host.querySelector('canvas')!;
		expect(
			parseFloat(canvas.style.width) / parseFloat(canvas.style.height)
		).toBeCloseTo(size.width / size.height);
	}
});

it('drops onto the preview and pastes outside text fields, remembering their origin', async () => {
	const event = new Event('drop', { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'dataTransfer', {
		value: {
			files: [new File(['image'], 'dropped.webp', { type: 'image/webp' })],
		},
	});
	await act(async () => host.querySelector('.stage')!.dispatchEvent(event));
	expect(event.defaultPrevented).toBe(true);
	expect(host.textContent).toContain('dropped.webp');
	await act(async () => {
		paste(host.querySelector('#artwork-name')!);
	});
	expect(decode).toHaveBeenCalledTimes(1);
	await act(async () => {
		expect(paste().defaultPrevented).toBe(true);
	});
	expect(host.textContent).toContain('Pasted image');
	expect(bitmap.close).toHaveBeenCalledOnce();
});

it('preserves the previous Original after a rejected file and shows its message', async () => {
	await choose();
	await choose(new File(['text'], 'bad.txt', { type: 'text/plain' }));
	expect(host.querySelector('[role="status"]')!.textContent).toBe(
		"That isn't an image"
	);
	expect(host.textContent).toContain('art.png');
	expect(bitmap.close).not.toHaveBeenCalled();
});

it('discards a late decode after a newer Original and frees it', async () => {
	let resolve!: (value: typeof bitmap) => void;
	decode.mockReturnValueOnce(
		new Promise((done) => {
			resolve = done;
		})
	);
	await choose(new File(['old'], 'old.png', { type: 'image/png' }));
	const next = { width: 400, height: 600, close: vi.fn() };
	decode.mockResolvedValueOnce(next);
	await choose(new File(['next'], 'next.png', { type: 'image/png' }));
	await act(async () => resolve(bitmap));
	expect(host.textContent).toContain('next.png');
	expect(bitmap.close).toHaveBeenCalledOnce();
	expect(next.close).not.toHaveBeenCalled();
	await act(async () => root.unmount());
	expect(next.close).toHaveBeenCalledOnce();
});
