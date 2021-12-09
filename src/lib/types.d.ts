/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
}

// https://stackoverflow.com/a/63085332/315168
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };