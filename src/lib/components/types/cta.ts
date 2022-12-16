export interface CTAButton {
	href: string;
	icon: string;
	label: string;
	onClick?: () => void;
	secondary?: boolean;
	tertiary?: boolean;
	target?: '_blank' | '_self' | '_parent' | '_top';
}
