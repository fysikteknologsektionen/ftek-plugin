import { useEffect, useRef, useState } from '@wordpress/element';

type ButtonProps = {
	toggleExpanded?: () => void;
	active?: boolean;
};

type Props = {
	content: React.ReactNode;
	children: React.ReactNode | ((close: () => void) => React.ReactNode);
	disabled?: boolean;
};

const Menu = ({
	Button,
	children,
}: {
	Button: (props: ButtonProps) => JSX.Element;
	children: React.ReactNode | ((close: () => void) => React.ReactNode);
}): JSX.Element => {
	const [expanded, setExpanded] = useState(false);
	const [position, setPosition] = useState<React.CSSProperties>({});
	const dropdownRef = useRef<HTMLDivElement>();
	const spanRef = useRef<HTMLDivElement>();

	useEffect(() => {
		if (dropdownRef.current) {
			const callback = (event: MouseEvent) => {
				if (
					event.target instanceof Element &&
					!dropdownRef.current.contains(event.target)
				) {
					setExpanded(false);
				}
			};
			window.addEventListener('click', callback);
			return () => window.removeEventListener('click', callback);
		}
	}, [dropdownRef.current]);

	const updatePosition = () => {
		const spanRect = spanRef.current.getBoundingClientRect();
		const docRect = document.documentElement.getBoundingClientRect();
		const dropdownRect = dropdownRef.current.getBoundingClientRect();

		setPosition({
			left:
				spanRect.left + dropdownRect.width > docRect.right
					? spanRect.right - dropdownRect.width
					: spanRect.left,
			top:
				spanRect.bottom + dropdownRect.height > docRect.bottom
					? spanRect.top - dropdownRect.height
					: spanRect.bottom,
		});
	};

	useEffect(() => {
		if (dropdownRef.current && spanRef.current) {
			updatePosition();

			window.addEventListener('scroll', updatePosition, true);
			window.addEventListener('resize', updatePosition, true);

			return () => {
				window.removeEventListener('scroll', updatePosition, true);
				window.removeEventListener('resize', updatePosition, true);
			};
		}
	}, [dropdownRef.current, spanRef.current]);

	return (
		<div
			ref={spanRef}
			style={{
				position: 'relative',
				display: 'inline-block',
			}}
		>
			<Button
				active={expanded}
				toggleExpanded={() => setExpanded(!expanded)}
			/>

			<div
				ref={dropdownRef}
				className="ftek-plugin-dropdown-area"
				style={{
					display: 'inline-block',
					backgroundColor: 'white',
					padding: '0.5rem',
					position: 'fixed',
					width: 'max-content',
					zIndex: 100,
					...position,
					opacity: expanded ? 1 : 0,
					pointerEvents: expanded ? 'initial' : 'none',
				}}
			>
				{typeof children === 'function'
					? children(() => setExpanded(false))
					: children}
			</div>
		</div>
	);
};

const Dropdown = ({
	content,
	children,
	disabled = false,
}: Props): JSX.Element => {
	const Button = (props: ButtonProps): JSX.Element => (
		<button
			className="ftek-plugin-dropdown-button"
			{...(props.active ? { active: '' } : {})}
			disabled={disabled}
			onClick={(e) => {
				e.stopPropagation();
				props.toggleExpanded?.();
			}}
		>
			{content}
		</button>
	);

	return disabled ? <Button /> : <Menu Button={Button}>{children}</Menu>;
};

Dropdown.Select = <T,>({
	options,
	onSelect,
	...props
}: Omit<Props, 'children'> & {
	options: { value: T; label: string }[];
	onSelect: (value: T) => void;
}): JSX.Element => (
	<Dropdown
		{...props}
		content={
			<span>
				{props.content}
				<span
					style={{
						marginLeft: '0.5rem',
						display: 'inline-block',
						transform: 'rotate(90deg)',
					}}
				>
					❯
				</span>
			</span>
		}
	>
		{(close) =>
			options.map((option, i) => (
				<button
					key={i}
					style={{
						display: 'block',
						cursor: 'pointer',
						width: '100%',
						textAlign: 'inherit',
					}}
					onClick={() => {
						onSelect(option.value);
						close();
					}}
				>
					{option.label}
				</button>
			))
		}
	</Dropdown>
);

export default Dropdown;
