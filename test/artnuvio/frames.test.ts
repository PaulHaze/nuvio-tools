import { describe, expect, it } from 'vitest';
import {
	FRAMES,
	FRAME_IDS,
	outputSize,
} from '../../src/tools/artnuvio/frames.ts';

describe('Frames table', () => {
	it('lists the four Frames in picker order', () => {
		expect(FRAME_IDS).toEqual(['hero', 'landscape', 'poster', 'square']);
	});

	it('gives every size exactly its Frame aspect', () => {
		for (const id of FRAME_IDS) {
			const { aspect, sizes } = FRAMES[id];
			for (const size of sizes) {
				expect(size.width * aspect.height, `${id} ${size.key}`).toBe(
					size.height * aspect.width
				);
			}
		}
	});

	it('gives Hero two 16:9 sizes', () => {
		const hero = FRAMES.hero;
		expect(hero.aspect).toEqual({ width: 16, height: 9 });
		expect(hero.sizes.map((s) => [s.width, s.height])).toEqual([
			[3840, 2160],
			[1920, 1080],
		]);
		for (const size of hero.sizes) {
			expect(size.width / size.height).toBeCloseTo(16 / 9, 10);
		}
	});

	it('sets the output size of each Frame', () => {
		expect(outputSize('landscape')).toMatchObject({
			width: 2560,
			height: 1440,
		});
		expect(outputSize('poster')).toMatchObject({ width: 1000, height: 1500 });
		expect(outputSize('square')).toMatchObject({ width: 1000, height: 1000 });
	});

	it('returns the chosen Hero size, defaulting to standard', () => {
		expect(outputSize('hero', 'full')).toMatchObject({
			width: 3840,
			height: 2160,
		});
		expect(outputSize('hero', 'standard')).toMatchObject({
			width: 1920,
			height: 1080,
		});
		expect(outputSize('hero')).toMatchObject({ width: 1920, height: 1080 });
	});
});
