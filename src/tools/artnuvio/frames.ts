// The single source of truth for ArtNuvio Frames: the Nuvio slots an Artwork is made for.
// Each Frame has a fixed shape and output size. See docs/sprints/artmvp/README.md.

export type FrameId = 'hero' | 'landscape' | 'poster' | 'square';

export type Aspect = {
	width: number;
	height: number;
};

export type OutputSize = Aspect & {
	/** Key used to pick this size, e.g. Hero's 'full' or 'standard'. */
	key: 'full' | 'standard';
	label: string;
};

export type FrameSpec = {
	label: string;
	aspect: Aspect;
	/** One size per option. Hero offers two; the other Frames have one. */
	sizes: readonly [OutputSize, ...OutputSize[]];
};

export const FRAMES: Record<FrameId, FrameSpec> = {
	hero: {
		label: 'Hero',
		aspect: { width: 16, height: 9 },
		sizes: [
			{ key: 'full', label: 'Full', width: 3840, height: 2160 },
			{ key: 'standard', label: 'Standard', width: 1920, height: 1080 },
		],
	},
	landscape: {
		label: 'Landscape',
		aspect: { width: 16, height: 9 },
		sizes: [{ key: 'standard', label: 'Standard', width: 2560, height: 1440 }],
	},
	poster: {
		label: 'Poster',
		aspect: { width: 2, height: 3 },
		sizes: [{ key: 'standard', label: 'Standard', width: 1000, height: 1500 }],
	},
	square: {
		label: 'Square',
		aspect: { width: 1, height: 1 },
		sizes: [{ key: 'standard', label: 'Standard', width: 1000, height: 1000 }],
	},
};

export const FRAME_IDS = Object.keys(FRAMES) as FrameId[];

/**
 * The output size for a Frame. Hero takes a size key ('full' or 'standard', default
 * 'standard'). The other Frames have only one size, so the key is ignored for them:
 * a key the Frame doesn't offer falls back to its first size.
 */
export function outputSize(
	frame: FrameId,
	sizeKey: OutputSize['key'] = 'standard'
): OutputSize {
	const { sizes } = FRAMES[frame];
	return sizes.find((size) => size.key === sizeKey) ?? sizes[0];
}
