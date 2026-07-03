export type GeneratedAtInput = string | Date | null | undefined;

export function normaliseGeneratedAt(generatedAt: GeneratedAtInput): string | null {
	if (!generatedAt) return null;

	const timestamp = new Date(generatedAt).getTime();
	if (!Number.isFinite(timestamp)) return String(generatedAt);

	return new Date(timestamp).toISOString();
}

export function isOlderThan(generatedAt: GeneratedAtInput, expectedGeneratedAt: string | null): boolean {
	if (!expectedGeneratedAt) return false;

	const generatedAtTimestamp = new Date(generatedAt ?? 0).getTime();
	const expectedTimestamp = new Date(expectedGeneratedAt).getTime();

	if (Number.isFinite(generatedAtTimestamp) && Number.isFinite(expectedTimestamp)) {
		return generatedAtTimestamp < expectedTimestamp;
	}

	return normaliseGeneratedAt(generatedAt) !== expectedGeneratedAt;
}
