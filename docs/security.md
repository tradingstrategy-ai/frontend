# Security

This document describes security considerations and configurations for the Trading Strategy frontend application.

## Content Security Policy (CSP)

- CSP enforced to prevent clickjacking via `frame-ancestors: self`
- Configured in `svelte.config.js`

## Geographic blocking

- Geographic blocking configured via `TS_PUBLIC_GEO_BLOCK` environment variable
- IP country detection via Cloudflare headers (handled in `hooks.server.ts`)

## Terms of Service

- Terms of Service contracts configured per blockchain network
- Contract addresses stored in runtime configuration

## Authentication

- Lightweight admin authentication via password (server hooks)
- Web3 wallet integration for user authentication via `@reown/appkit` and `wagmi`

## CAPTCHA

- Cloudflare Turnstile CAPTCHA integration for form protection
