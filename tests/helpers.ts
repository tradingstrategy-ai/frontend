export function webServerConfig(mode: string) {
	return {
		command: `pnpm run preview --mode=${mode} --host=127.0.0.1 --port=4173`,
		port: 4173
	};
}
