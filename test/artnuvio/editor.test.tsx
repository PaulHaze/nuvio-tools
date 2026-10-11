// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Editor from '../../src/tools/artnuvio/components/Editor';
import { FRAMES, FRAME_IDS } from '../../src/tools/artnuvio/frames';
import {
	panBy,
	placeMode,
	scaleRange,
	zoomTo,
} from '../../src/tools/artnuvio/framing';
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
			constructor(private callback: () => void) {}
			observe() {
				this.callback();
			}
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
	expect(host.querySelector('[role="alert"]')!.textContent).toBe(
		"That isn't an image"
	);
	expect(host.querySelector('[role="status"]')).not.toBeNull();
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

it('ignores files dropped outside the preview and reports non-image pastes', async () => {
	const drop = new Event('drop', { bubbles: true, cancelable: true });
	Object.defineProperty(drop, 'dataTransfer', {
		value: {
			types: ['Files'],
			files: [new File(['x'], 'x.png', { type: 'image/png' })],
		},
	});
	await act(async () => document.body.dispatchEvent(drop));
	expect(drop.defaultPrevented).toBe(true);
	expect(decode).not.toHaveBeenCalled();
	const event = new Event('paste', { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'clipboardData', {
		value: {
			items: [
				{
					kind: 'file',
					type: 'application/pdf',
					getAsFile: () =>
						new File(['x'], 'a.pdf', { type: 'application/pdf' }),
				},
			],
		},
	});
	await act(async () => document.dispatchEvent(event));
	expect(host.querySelector('[role="alert"]')!.textContent).toBe(
		"That isn't an image"
	);
});

function modeInput(mode: 'fit' | 'cover' | 'custom') {
	return host.querySelector<HTMLInputElement>(
		`input[name="mode"][value="${mode}"]`
	)!;
}
function lastPlacement() {
	return vi.mocked(drawPlacement).mock.calls.at(-1)![3];
}
async function changeScale(scale: number) {
	const input = host.querySelector<HTMLInputElement>('#scale-in')!;
	// Use the native setter so React receives a genuine input value change.
	Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		'value'
	)!.set!.call(input, String(scale));
	await act(async () =>
		input.dispatchEvent(new Event('input', { bubbles: true }))
	);
}

it('clears Fit/Cover with the slider and resets scale and position on either radio', async () => {
	await choose();
	const size = FRAMES.hero.sizes[0];
	const range = scaleRange(bitmap, size);
	const slider = host.querySelector<HTMLInputElement>('#scale-in')!;
	expect(Number(slider.min)).toBe(range.min);
	expect(Number(slider.max)).toBe(range.max);
	expect(modeInput('cover').checked).toBe(true);
	await act(async () => modeInput('fit').click());
	expect(lastPlacement()).toEqual(placeMode(bitmap, size, 'fit'));
	await changeScale(5);
	expect(lastPlacement()).toEqual(
		zoomTo(bitmap, size, placeMode(bitmap, size, 'fit'), 5)
	);
	expect(modeInput('fit').checked).toBe(false);
	expect(modeInput('cover').checked).toBe(false);
	await act(async () => modeInput('cover').click());
	expect(lastPlacement()).toEqual(placeMode(bitmap, size, 'cover'));
	await changeScale(4);
	await choose(new File(['next'], 'next.png', { type: 'image/png' }));
	expect(lastPlacement()).toEqual(placeMode(bitmap, size, 'cover'));
	expect(modeInput('cover').checked).toBe(true);
	await act(async () => modeInput('fit').click());
	await act(async () =>
		host
			.querySelector<HTMLInputElement>('input[name="frame"][value="poster"]')!
			.click()
	);
	expect(lastPlacement()).toEqual(
		placeMode(bitmap, FRAMES.poster.sizes[0], 'cover')
	);
	expect(modeInput('cover').checked).toBe(true);
});

it('captures dragging in Frame pixels, preserves the mode, and resets an already selected radio', async () => {
	await choose();
	const canvas = host.querySelector('canvas')!;
	vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
		width: 600,
		height: 337.5,
	} as DOMRect);
	const capture = vi.fn();
	const release = vi.fn();
	canvas.setPointerCapture = capture;
	canvas.hasPointerCapture = () => true;
	canvas.releasePointerCapture = release;
	async function pointer(type: string, x: number, y: number, id = 1) {
		await act(async () =>
			canvas.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					pointerId: id,
					button: 0,
					clientX: x,
					clientY: y,
				})
			)
		);
	}
	await pointer('pointerdown', 100, 100);
	expect(capture).toHaveBeenCalledWith(1);
	expect(host.querySelector('.preview')!.getAttribute('data-panning')).toBe(
		'1'
	);
	await pointer('pointermove', 100, 110, 2);
	expect(lastPlacement()).toEqual(
		placeMode(bitmap, FRAMES.hero.sizes[0], 'cover')
	);
	await pointer('pointermove', 100, 110);
	expect(lastPlacement()).toEqual(
		panBy(
			bitmap,
			FRAMES.hero.sizes[0],
			placeMode(bitmap, FRAMES.hero.sizes[0], 'cover'),
			0,
			64
		)
	);
	expect(modeInput('cover').checked).toBe(true);
	await pointer('pointerup', 100, 110);
	expect(release).toHaveBeenCalledWith(1);
	expect(host.querySelector('.preview')!.getAttribute('data-panning')).toBe(
		'0'
	);
	await act(async () => modeInput('cover').click());
	expect(lastPlacement()).toEqual(
		placeMode(bitmap, FRAMES.hero.sizes[0], 'cover')
	);
	await act(async () => modeInput('fit').click());
	await pointer('pointerdown', 100, 100);
	await pointer('pointermove', 90, 100);
	expect(modeInput('fit').checked).toBe(true);
	await pointer('pointercancel', 90, 100);
	expect(host.querySelector('.preview')!.getAttribute('data-panning')).toBe(
		'0'
	);
	await act(async () => modeInput('fit').click());
	expect(lastPlacement()).toEqual(
		placeMode(bitmap, FRAMES.hero.sizes[0], 'fit')
	);
});

it('shows Custom and its hint after a slider move, and Fit/Cover snap back', async () => {
	await choose();
	const hint = () => host.querySelector('.c-fit .ctl-hint')!.textContent;
	const cap = () => host.querySelector('.cap-right')!.textContent;
	expect(modeInput('custom').checked).toBe(false);
	await changeScale(5);
	expect(cap()).toBe('Custom');
	expect(modeInput('custom').checked).toBe(true);
	expect(hint()).toBe('Custom sizing');
	expect(host.querySelector('.marks')).toBeNull();
	await act(async () => modeInput('fit').click());
	expect(modeInput('custom').checked).toBe(false);
	expect(cap()).toBe('Fit');
});

it('ignores non-primary pointerdown and ends a drag on lostpointercapture', async () => {
	await choose();
	const canvas = host.querySelector('canvas')!;
	vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
		width: 600,
		height: 337.5,
	} as DOMRect);
	const capture = vi.fn();
	canvas.setPointerCapture = capture;
	canvas.hasPointerCapture = () => false;
	const fire = (type: string, button = 0) =>
		act(async () =>
			canvas.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					pointerId: 1,
					button,
					clientX: 10,
					clientY: 10,
				})
			)
		);
	const panning = () =>
		host.querySelector('.preview')!.getAttribute('data-panning');
	await fire('pointerdown', 2);
	expect(capture).not.toHaveBeenCalled();
	expect(panning()).toBe('0');
	await fire('pointerdown');
	expect(panning()).toBe('1');
	await fire('lostpointercapture');
	expect(panning()).toBe('0');
});
