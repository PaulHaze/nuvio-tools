import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
} from 'react';
import { FRAME_IDS, FRAMES, type FrameId } from '../frames';
import { placeMode, type Placement } from '../framing';
import { drawPlacement } from '../drawPlacement';
import {
	loadOriginal,
	ORIGINAL_TYPES,
	type Original,
	type OriginalSource,
} from '../original';

type EditorState = {
	original: Original | null;
	frame: FrameId;
	placement: Placement | null;
};
const fillHint = 'Cover fills the whole Frame. Fit shows the whole image.';

function Glyph({ frame, size = 12 }: { frame: FrameId; size?: number }) {
	const { width, height } = FRAMES[frame].aspect;
	const ratio = width / height;
	const side = ratio === 1 ? size * 0.85 : size;
	return (
		<span
			className="glyph"
			aria-hidden="true"
			style={{
				width: ratio >= 1 ? side : side * ratio,
				height: ratio >= 1 ? side / ratio : side,
			}}
		/>
	);
}

function ImageIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			aria-hidden="true"
		>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="8.5" cy="8.5" r="1.5" />
			<path d="m21 15-5-5L5 21" />
		</svg>
	);
}

function isTyping(target: EventTarget | null): boolean {
	return (
		target instanceof Element &&
		!!target.closest(
			'input:not([type="radio"]):not([type="checkbox"]):not([type="range"]):not([type="file"]), textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'
		)
	);
}

export default function Editor() {
	const [editor, setEditor] = useState<EditorState>({
		original: null,
		frame: 'hero',
		placement: null,
	});
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const originalRef = useRef<Original | null>(null);
	const requestRef = useRef(0);
	const { original, frame, placement } = editor;
	const spec = FRAMES[frame];
	const frameSize = spec.sizes[0];

	const load = useCallback(async (blob: Blob, source: OriginalSource) => {
		const request = ++requestRef.current;
		setLoading(true);
		setMessage('');
		try {
			const next = await loadOriginal(blob, source);
			if (request !== requestRef.current) {
				next.bitmap.close();
				return;
			}
			originalRef.current?.bitmap.close();
			originalRef.current = next;
			setEditor((current) => ({
				...current,
				original: next,
				placement: placeMode(next, FRAMES[current.frame].sizes[0], 'cover'),
			}));
		} catch (error) {
			if (request === requestRef.current)
				setMessage(
					error instanceof Error
						? error.message
						: "That image couldn't be loaded. Try another image."
				);
		} finally {
			if (request === requestRef.current) setLoading(false);
		}
	}, []);

	useEffect(() => {
		const paste = (event: ClipboardEvent) => {
			if (isTyping(event.target)) return;
			const items = Array.from(event.clipboardData?.items ?? []);
			const item =
				items.find(
					(item) => item.kind === 'file' && item.type.startsWith('image/')
				) ?? items.find((item) => item.kind === 'file');
			const blob = item?.getAsFile();
			if (!blob) return;
			event.preventDefault();
			void load(blob, { kind: 'paste' });
		};
		const hasFiles = (event: DragEvent) =>
			Array.from(event.dataTransfer?.types ?? []).includes('Files');
		const stop = (event: DragEvent) => {
			if (hasFiles(event)) event.preventDefault();
		};
		document.addEventListener('paste', paste);
		document.addEventListener('dragover', stop);
		document.addEventListener('drop', stop);
		return () => {
			document.removeEventListener('paste', paste);
			document.removeEventListener('dragover', stop);
			document.removeEventListener('drop', stop);
			++requestRef.current;
			originalRef.current?.bitmap.close();
			originalRef.current = null;
		};
	}, [load]);

	useEffect(() => {
		const area = previewRef.current;
		const canvas = canvasRef.current;
		if (!area || !canvas || !original || !placement) return;
		const draw = () => {
			const rect = area.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return;
			const scale = Math.min(
				rect.width / frameSize.width,
				rect.height / frameSize.height
			);
			const width = frameSize.width * scale;
			const height = frameSize.height * scale;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			const ratio = window.devicePixelRatio || 1;
			const pixelWidth = Math.max(1, Math.round(width * ratio));
			const pixelHeight = Math.max(1, Math.round(height * ratio));
			if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
			if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
			const ctx = canvas.getContext('2d');
			if (ctx)
				drawPlacement(ctx, original.bitmap, frameSize, placement, canvas);
		};
		// ResizeObserver fires once on observe, which performs the first draw.
		const observer = new ResizeObserver(draw);
		observer.observe(area);
		return () => observer.disconnect();
	}, [original, placement, frameSize]);

	const pickFrame = (frame: FrameId) =>
		setEditor((current) => ({
			...current,
			frame,
			placement: current.original
				? placeMode(current.original, FRAMES[frame].sizes[0], 'cover')
				: null,
		}));
	const choose = () => inputRef.current?.click();

	return (
		<section aria-label="Editor">
			<input
				ref={inputRef}
				type="file"
				accept={ORIGINAL_TYPES.join(',')}
				hidden
				aria-label="Choose Original file"
				onChange={(event) => {
					const file = event.currentTarget.files?.[0];
					event.currentTarget.value = '';
					if (file) void load(file, { kind: 'file', fileName: file.name });
				}}
			/>
			<div className="ed">
				<div className="ed-col">
					<div
						className="stage"
						data-has={original ? '1' : '0'}
						data-dragging={dragging ? '1' : '0'}
						aria-busy={loading}
						onDragOver={(event) => {
							event.preventDefault();
							event.dataTransfer.dropEffect = 'copy';
							setDragging(true);
						}}
						onDragLeave={(event) => {
							if (
								!event.currentTarget.contains(
									event.relatedTarget as Node | null
								)
							)
								setDragging(false);
						}}
						onDrop={(event) => {
							event.preventDefault();
							setDragging(false);
							const file = event.dataTransfer.files[0];
							if (file) void load(file, { kind: 'file', fileName: file.name });
						}}
					>
						<div className="stage-cap">
							<span className="cap-left">
								<Glyph frame={frame} size={13} />
								<span>
									{spec.label} · {spec.aspect.width}:{spec.aspect.height} ·{' '}
									{frameSize.width}×{frameSize.height}
								</span>
							</span>
							<span className="cap-right">
								{loading ? 'Loading Original…' : original ? 'Cover' : ''}
							</span>
						</div>
						{original ? (
							<div className="preview" ref={previewRef}>
								<canvas
									ref={canvasRef}
									aria-label={`${spec.label} Frame preview`}
									role="img"
								/>
							</div>
						) : (
							<div className="drop">
								<div className="drop-inner">
									<span className="drop-icon">
										<ImageIcon />
									</span>
									<h2 className="drop-title">Start with an Original</h2>
									<p className="drop-lead">
										Paste an image (⌘/Ctrl+V), or drop a file onto this preview.
									</p>
									<div className="drop-or">
										<span>or</span>
									</div>
									<div className="drop-file">
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											onClick={choose}
										>
											Choose file…
										</button>
										<span className="drop-limit text-muted">
											Images up to 25 MB
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
					<div className="orig-bar">
						<span className="orig-thumb">
							<ImageIcon />
						</span>
						<div className="orig-meta">
							<span className="orig-name">
								{original
									? original.source.kind === 'file'
										? original.source.fileName
										: 'Pasted image'
									: 'No Original yet'}
							</span>
							<span className="orig-dims">
								{original
									? `${original.width}×${original.height} · Drop or paste to change`
									: 'Drop a file or paste an image (⌘/Ctrl+V)'}
							</span>
							<span className="original-message" role="status">
								{loading ? 'Loading Original…' : ''}
							</span>
							<span className="original-error text-danger" role="alert">
								{message}
							</span>
						</div>
						<label className="check">
							<input type="checkbox" disabled /> Show cropped edges
						</label>
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							onClick={choose}
						>
							Choose file…
						</button>
					</div>
					<section className="setstrip" aria-label="Folder set">
						<div className="set-head">
							<span className="eyebrow">Folder set</span>
							<span className="text-muted">
								Type a Name to see which Frames that folder already has.
							</span>
						</div>
						<div className="set-slots">
							{FRAME_IDS.map((id) => (
								<div
									className={['slot', id === frame ? 'cur' : ''].join(' ')}
									key={id}
								>
									<button
										type="button"
										className="slot-hit"
										aria-label={`Edit ${FRAMES[id].label}`}
										onClick={() => pickFrame(id)}
									>
										<span
											className="thumb thumb-empty"
											style={{
												aspectRatio: `${FRAMES[id].aspect.width} / ${FRAMES[id].aspect.height}`,
											}}
										/>
										<span className="slot-name">
											<Glyph frame={id} size={11} />
											{FRAMES[id].label}
										</span>
										<span className="slot-stat">
											{id === frame ? 'Editing' : 'Not made'}
										</span>
									</button>
								</div>
							))}
						</div>
					</section>
				</div>
				<aside className="rail panel" aria-label="Artwork settings">
					<fieldset className="ctl c-pick">
						<legend className="eyebrow">Frame</legend>
						<div className="fpick">
							{FRAME_IDS.map((id) => (
								<label className="fopt" key={id}>
									<input
										type="radio"
										name="frame"
										value={id}
										checked={id === frame}
										onChange={() => pickFrame(id)}
									/>
									<span className="fshape">
										<Glyph frame={id} size={20} />
									</span>
									<span className="fname">{FRAMES[id].label}</span>
									<span className="fsize">
										{FRAMES[id].sizes[0].width}×{FRAMES[id].sizes[0].height}
									</span>
								</label>
							))}
						</div>
					</fieldset>
					<div className="adjust">
						<fieldset className="ctl c-fit is-disabled">
							<legend className="eyebrow">Fill</legend>
							<div className="seg">
								<label>
									<input type="radio" name="mode" value="fit" disabled />
									Fit
								</label>
								<label>
									<input
										type="radio"
										name="mode"
										value="cover"
										checked={!!original}
										disabled
									/>
									Cover
								</label>
							</div>
							<p className="ctl-hint">{fillHint}</p>
						</fieldset>
						<div className="ctl c-scale is-disabled">
							<label className="eyebrow ctl-label" htmlFor="scale-in">
								Scale{' '}
								<output className="scale-out" htmlFor="scale-in">
									{placement ? `${placement.scale.toFixed(2)}×` : '–'}
								</output>
							</label>
							<div className="range-wrap">
								<input
									id="scale-in"
									className="range"
									type="range"
									min="0"
									max="1000"
									step="1"
									value="500"
									style={{ '--fill': '50%' } as CSSProperties}
									disabled
								/>
								<div className="marks" aria-hidden="true">
									<button
										type="button"
										className="mark"
										tabIndex={-1}
										style={{ left: '30%' }}
										disabled
									>
										Fit
									</button>
									<button
										type="button"
										className="mark"
										tabIndex={-1}
										style={{ left: '50%' }}
										disabled
									>
										Cover
									</button>
								</div>
							</div>
							<p className="soft" aria-live="polite" />
						</div>
						<p className="ctl-hint adj-hint">{fillHint}</p>
						<fieldset className="ctl c-size is-disabled">
							<legend className="eyebrow">Saved size</legend>
							<div className="size-body">
								<div role="radiogroup" aria-label={`${spec.label} size`}>
									{spec.sizes.map((size, i) => (
										<label className="size-opt" key={size.key}>
											<input
												type="radio"
												name="saved-size"
												value={size.key}
												checked={i === 0}
												disabled
											/>
											<span className="font-mono">
												{size.width}×{size.height}
											</span>
										</label>
									))}
								</div>
								{frame === 'hero' && (
									<p className="ctl-hint">
										3840×2160 is offered when the Original is big enough.
									</p>
								)}
							</div>
						</fieldset>
					</div>
					<div className="ctl c-save">
						<label className="eyebrow ctl-label" htmlFor="artwork-name">
							Name{' '}
							<span className="name-label-hint">the Nuvio folder it's for</span>
						</label>
						<div className="save-row">
							<div className="name-wrap">
								<input
									id="artwork-name"
									type="text"
									autoComplete="off"
									placeholder="e.g. Serial Killer movies"
									aria-describedby="name-hint"
								/>
							</div>
							<button type="button" className="btn btn-save" disabled>
								Save {spec.label}
							</button>
						</div>
						<p className="name-hint" id="name-hint">
							<span>
								One Artwork per Frame per name, so a folder can have a Hero{' '}
								<em>and</em> a Poster.
							</span>
						</p>
					</div>
				</aside>
			</div>
		</section>
	);
}
