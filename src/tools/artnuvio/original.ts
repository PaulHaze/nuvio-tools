import type { Aspect } from './frames';

export type OriginalSource =
	{ kind: 'file'; fileName: string } | { kind: 'paste' };
export type Original = Aspect & {
	bitmap: ImageBitmap;
	source: OriginalSource;
};

export const ORIGINAL_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/avif',
];
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
export const MAX_ORIGINAL_PIXELS = 100_000_000;

/** Validate before decoding, and before passing dimensions to framing maths. */
export async function loadOriginal(
	blob: Blob,
	source: OriginalSource
): Promise<Original> {
	if (!blob.type.startsWith('image/')) throw new Error("That isn't an image");
	if (!ORIGINAL_TYPES.includes(blob.type))
		throw new Error("That image type isn't supported");
	if (blob.size > MAX_ORIGINAL_BYTES)
		throw new Error('That image is over 25 MB');
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
	} catch {
		throw new Error("That image couldn't be decoded. Try another image.");
	}
	const { width, height } = bitmap;
	if (
		!Number.isFinite(width) ||
		!Number.isFinite(height) ||
		width <= 0 ||
		height <= 0
	) {
		bitmap.close();
		throw new Error('That image has invalid dimensions. Try another image.');
	}
	if (width * height > MAX_ORIGINAL_PIXELS) {
		bitmap.close();
		throw new Error('That image is too large (over 100 megapixels)');
	}
	return { bitmap, width, height, source };
}
