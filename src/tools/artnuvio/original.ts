import type { Aspect } from './frames';

export type OriginalSource =
	{ kind: 'file'; fileName: string } | { kind: 'paste' };
export type Original = Aspect & {
	bitmap: ImageBitmap;
	source: OriginalSource;
};

export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

/** Validate before decoding, and before passing dimensions to framing maths. */
export async function loadOriginal(
	blob: Blob,
	source: OriginalSource
): Promise<Original> {
	if (!blob.type.startsWith('image/')) throw new Error("That isn't an image");
	if (blob.size > MAX_ORIGINAL_BYTES)
		throw new Error('That image is over 25 MB');
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(blob);
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
	return { bitmap, width, height, source };
}
