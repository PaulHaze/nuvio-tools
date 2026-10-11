import type { Aspect } from './frames.ts';

export type Mode = 'cover' | 'fit' | null;

export type Placement = {
	mode: Mode;
	/** Full-size output pixels per Original pixel. */
	scale: number;
	/** Original centre in full-size Frame pixels. */
	cx: number;
	cy: number;
}

// Image dimensions are Original pixels; Frame dimensions are full-size output
// pixels (always 3840×2160 for Hero, even when saving its standard size).
// Dimensions and placement scales must be positive, finite numbers.
export function coverScale(image: Aspect, frame: Aspect): number {
	return Math.max(frame.width / image.width, frame.height / image.height);
}

export function fitScale(image: Aspect, frame: Aspect): number {
	return Math.min(frame.width / image.width, frame.height / image.height);
}

export function scaleRange(
	image: Aspect,
	frame: Aspect
): { min: number; max: number } {
	return {
		min: 0.5 * fitScale(image, frame),
		max: 4 * coverScale(image, frame),
	};
}

export function placeMode(
	image: Aspect,
	frame: Aspect,
	mode: Exclude<Mode, null>
): Placement {
	return {
		mode,
		scale: mode === 'cover' ? coverScale(image, frame) : fitScale(image, frame),
		cx: frame.width / 2,
		cy: frame.height / 2,
	};
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function clampAxis(
	centre: number,
	drawnSize: number,
	frameSize: number
): number {
	const half = drawnSize / 2;
	// Bigger images cover the axis; smaller images stay inside it. At equality
	// both bounds are the Frame centre.
	return clamp(
		centre,
		Math.min(half, frameSize - half),
		Math.max(half, frameSize - half)
	);
}

export function clampCentre(
	image: Aspect,
	frame: Aspect,
	placement: Placement
): Placement {
	return {
		...placement,
		cx: clampAxis(placement.cx, image.width * placement.scale, frame.width),
		cy: clampAxis(placement.cy, image.height * placement.scale, frame.height),
	};
}

export function zoomTo(
	image: Aspect,
	frame: Aspect,
	placement: Placement,
	newScale: number
): Placement {
	const { min, max } = scaleRange(image, frame);
	const scale = clamp(newScale, min, max);
	const ratio = scale / placement.scale;
	const frameCx = frame.width / 2;
	const frameCy = frame.height / 2;
	return clampCentre(image, frame, {
		mode: null,
		scale,
		cx: frameCx + (placement.cx - frameCx) * ratio,
		cy: frameCy + (placement.cy - frameCy) * ratio,
	});
}

export function panBy(
	image: Aspect,
	frame: Aspect,
	placement: Placement,
	dx: number,
	dy: number
): Placement {
	return clampCentre(image, frame, {
		...placement,
		cx: placement.cx + dx,
		cy: placement.cy + dy,
	});
}

/** savedScaleFactor is 1, or 0.5 when saving a 1920×1080 Hero. */
export function enlargement(
	placement: Placement,
	savedScaleFactor: number
): number {
	return placement.scale * savedScaleFactor;
}

export function isSoft(
	placement: Placement,
	savedScaleFactor: number
): boolean {
	return enlargement(placement, savedScaleFactor) > 1.35;
}

export function heroFullSizeAllowed(placement: Placement): boolean {
	return placement.scale <= 1;
}
