import { describe, expect, it } from 'vitest';
import {
	outputSize,
	type Aspect,
	type FrameId,
} from '../../src/tools/artnuvio/frames.ts';
import {
	clampCentre,
	coverScale,
	enlargement,
	fitScale,
	heroFullSizeAllowed,
	isSoft,
	panBy,
	placeMode,
	scaleRange,
	zoomTo,
	type Mode,
	type Placement,
} from '../../src/tools/artnuvio/framing.ts';

const originals = {
	wide: { width: 4000, height: 1000 },
	tall: { width: 1000, height: 4000 },
	square: { width: 2000, height: 2000 },
};

const scaleCases: [FrameId, keyof typeof originals, number, number][] = [
	['hero', 'wide', 2.16, 0.96],
	['hero', 'tall', 3.84, 0.54],
	['hero', 'square', 1.92, 1.08],
	['landscape', 'wide', 1.44, 0.64],
	['landscape', 'tall', 2.56, 0.36],
	['landscape', 'square', 1.28, 0.72],
	['poster', 'wide', 1.5, 0.25],
	['poster', 'tall', 1, 0.375],
	['poster', 'square', 0.75, 0.5],
	['square', 'wide', 1, 0.25],
	['square', 'tall', 1, 0.25],
	['square', 'square', 0.5, 0.5],
];

describe('Frame scales and modes', () => {
	it.each(scaleCases)('%s with a %s Original', (id, shape, cover, fit) => {
		const frame = outputSize(id, 'full');
		const image = originals[shape];
		expect(coverScale(image, frame)).toBeCloseTo(cover, 12);
		expect(fitScale(image, frame)).toBeCloseTo(fit, 12);
		expect(scaleRange(image, frame).min).toBeCloseTo(0.5 * fit, 12);
		expect(scaleRange(image, frame).max).toBeCloseTo(4 * cover, 12);
		for (const [mode, scale] of [
			['cover', cover],
			['fit', fit],
		] as const) {
			const placement = placeMode(image, frame, mode);
			expect(placement.mode).toBe(mode);
			expect(placement.scale).toBeCloseTo(scale, 12);
			expect(placement.cx).toBe(frame.width / 2);
			expect(placement.cy).toBe(frame.height / 2);
		}
	});
});

const frame = { width: 1000, height: 800 };
const square = { width: 1000, height: 1000 };

function placement(
	scale: number,
	cx = 500,
	cy = 400,
	mode: Mode = 'cover'
): Placement {
	return { mode, scale, cx, cy };
}

function expectContained(image: Aspect, result: Placement): void {
	for (const [centre, drawn, size] of [
		[result.cx, image.width * result.scale, frame.width],
		[result.cy, image.height * result.scale, frame.height],
	]) {
		const left = centre - drawn / 2;
		const right = centre + drawn / 2;
		if (drawn >= size) {
			expect(left).toBeLessThanOrEqual(0);
			expect(right).toBeGreaterThanOrEqual(size);
		} else {
			expect(left).toBeGreaterThanOrEqual(0);
			expect(right).toBeLessThanOrEqual(size);
		}
	}
}

describe('clamping and panning', () => {
	it.each([
		['both bigger', { width: 1600, height: 1200 }, [-800, -700], [200, 200]],
		['both bigger', { width: 1600, height: 1200 }, [1800, 1700], [800, 600]],
		['both smaller', { width: 400, height: 200 }, [-800, -700], [200, 100]],
		['both smaller', { width: 400, height: 200 }, [1800, 1700], [800, 700]],
		['wide and short', { width: 1600, height: 200 }, [-800, 1700], [200, 700]],
		['narrow and tall', { width: 400, height: 1200 }, [1800, -700], [800, 200]],
		['exactly equal', { width: 1000, height: 800 }, [-800, 1700], [500, 400]],
	] as const)('clamps %s at (%s)', (_label, image, centre, expected) => {
		const before = placement(1, centre[0], centre[1], 'fit');
		const result = clampCentre(image, frame, before);
		expect(result).toEqual(placement(1, expected[0], expected[1], 'fit'));
		expectContained(image, result);
		expect(before.cx).toBe(centre[0]);
		expect(before.cy).toBe(centre[1]);
	});

	it('uses the drawn size after scaling and preserves an allowed centre', () => {
		const before = placement(0.5, 400, 300, null);
		expect(clampCentre(square, frame, before)).toEqual(before);
		expect(clampCentre(square, frame, placement(2, -1000, 2000))).toEqual(
			placement(2, 0, 1000)
		);
	});

	it.each(['cover', 'fit', null] as const)(
		'pans in Frame pixels and keeps mode %s',
		(mode) => {
			const before = placement(2, 500, 400, mode);
			expect(panBy(square, frame, before, 80, -60)).toEqual(
				placement(2, 580, 340, mode)
			);
			for (const delta of [-10000, 10000]) {
				const result = panBy(square, frame, before, delta, delta);
				expectContained(square, result);
				expect(result.mode).toBe(mode);
			}
			expect(before).toEqual(placement(2, 500, 400, mode));
		}
	);

	it('keeps small panned Originals inside the Frame', () => {
		expect(panBy(square, frame, placement(0.4), -10000, 10000)).toEqual(
			placement(0.4, 200, 600)
		);
	});
});

describe('zooming about the Frame centre', () => {
	it.each([1.5, 3])(
		'keeps the same Original point at the centre at scale %s',
		(scale) => {
			const before = placement(2, 600, 500, 'fit');
			const result = zoomTo(square, frame, before, scale);
			expect(result.scale).toBe(scale);
			expect(result.mode).toBeNull();
			expect((500 - result.cx) / result.scale).toBeCloseTo(
				(500 - before.cx) / before.scale
			);
			expect((400 - result.cy) / result.scale).toBeCloseTo(
				(400 - before.cy) / before.scale
			);
			expect(before).toEqual(placement(2, 600, 500, 'fit'));
		}
	);

	it.each([-10, 0.4, 4, 100])(
		'clamps slider input %s to its limits',
		(requested) => {
			const result = zoomTo(square, frame, placement(1), requested);
			expect(result).toEqual(
				placement(Math.max(0.4, Math.min(4, requested)), 500, 400, null)
			);
		}
	);

	it('uses the clamped scale for the centre-point calculation', () => {
		expect(zoomTo(square, frame, placement(2, 600, 500), 100)).toEqual(
			placement(4, 700, 600, null)
		);
	});

	it('clamps the position after zooming when the centre anchor would escape', () => {
		const result = zoomTo(square, frame, placement(2, 1000, 1000), 1);
		expect(result).toEqual(placement(1, 500, 500, null));
		expectContained(square, result);
	});

	it('clears the mode even when the requested scale is unchanged', () => {
		expect(zoomTo(square, frame, placement(1), 1).mode).toBeNull();
	});
});

describe('saved enlargement and Hero eligibility', () => {
	it.each([1, 0.5])('calculates softness at saved size factor %s', (factor) => {
		for (const [enlarged, soft] of [
			[1.349, false],
			[1.35, false],
			[1.351, true],
		] as const) {
			const current = placement(enlarged / factor);
			expect(enlargement(current, factor)).toBe(enlarged);
			expect(isSoft(current, factor)).toBe(soft);
		}
	});

	it('can offer full Hero size at scale 1 and below, but not just above', () => {
		expect(heroFullSizeAllowed(placement(0.999))).toBe(true);
		expect(heroFullSizeAllowed(placement(1))).toBe(true);
		expect(heroFullSizeAllowed(placement(1.000001))).toBe(false);
	});
});
