import type { Aspect } from './frames';
import type { Placement } from './framing';

/** Draw full-size Frame coordinates into a preview or export canvas of the same aspect. */
export function drawPlacement(
	ctx: CanvasRenderingContext2D,
	bitmap: ImageBitmap,
	frame: Aspect,
	placement: Placement,
	size: Aspect
): void {
	ctx.save();
	ctx.setTransform(
		size.width / frame.width,
		0,
		0,
		size.height / frame.height,
		0,
		0
	);
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, frame.width, frame.height);
	ctx.beginPath();
	ctx.rect(0, 0, frame.width, frame.height);
	ctx.clip();
	const width = bitmap.width * placement.scale;
	const height = bitmap.height * placement.scale;
	ctx.drawImage(
		bitmap,
		placement.cx - width / 2,
		placement.cy - height / 2,
		width,
		height
	);
	ctx.restore();
}
