import { expect, it, vi } from 'vitest';
import { drawPlacement } from '../../src/tools/artnuvio/drawPlacement';
import { placeMode } from '../../src/tools/artnuvio/framing';

it('scales placement coordinates into the canvas, fills black and clips the whole Frame', () => {
	const ctx = {
		save: vi.fn(),
		restore: vi.fn(),
		setTransform: vi.fn(),
		fillRect: vi.fn(),
		beginPath: vi.fn(),
		rect: vi.fn(),
		clip: vi.fn(),
		drawImage: vi.fn(),
		fillStyle: '',
	};
	const bitmap = { width: 400, height: 200 } as ImageBitmap;
	const frame = { width: 1000, height: 1000 };
	drawPlacement(
		ctx as unknown as CanvasRenderingContext2D,
		bitmap,
		frame,
		placeMode(bitmap, frame, 'cover'),
		{ width: 200, height: 200 }
	);
	expect(ctx.setTransform).toHaveBeenCalledWith(0.2, 0, 0, 0.2, 0, 0);
	expect(ctx.fillStyle).toBe('#000');
	expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 1000);
	expect(ctx.rect).toHaveBeenCalledWith(0, 0, 1000, 1000);
	expect(ctx.clip).toHaveBeenCalledOnce();
	expect(ctx.drawImage).toHaveBeenCalledWith(bitmap, -500, 0, 2000, 1000);
	expect(ctx.restore).toHaveBeenCalledOnce();
});
