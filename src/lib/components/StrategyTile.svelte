<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import Button from './ButtonNew.svelte';
	import EntitySymbol from './EntitySymbol.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import Tooltip from './Tooltip.svelte';
	import isInViewport from '$lib/helpers/is-in-viewport';

	export let strategy: StrategyRuntimeState;

	const backtestLink = `/strategies/${strategy.id}/backtest`;

	let ctaButton: HTMLButtonElement;
	let innerWidth: number;

	$: isBacktested = strategy?.summary_statistics?.key_metrics
		? Object.values(strategy.summary_statistics.key_metrics).some((metric: any) => metric?.source === 'backtesting')
		: false;

	function blur() {
		if (!isInViewport(ctaButton)) return;
		ctaButton.blur();
	}

	function focus() {
		if (!isInViewport(ctaButton)) return;
		ctaButton.focus();
	}

	function getChainSlug(chain_id: number) {
		switch (chain_id) {
			case 1:
				return 'ethereum';
			case 137:
				return 'polygon';
		}
	}

	function getStrategyTokens({ id }: StrategyRuntimeState) {
		if (id.includes('multipair')) {
			return ['usdc'];
		} else if (id.includes('matic')) {
			return ['matic', 'usdc'];
		} else {
			return ['eth', 'usdc'];
		}
	}
</script>

<svelte:window bind:innerWidth />

<a
	class="strategy-tile"
	href={`/strategies/${strategy.link.replace('/strategy/', '')}`}
	on:focus={focus}
	on:mouseover={focus}
	on:blur={blur}
	on:mouseleave={blur}
>
	<div class="visuals">
		<div class="top">
			<div class="tokens">
				{#each getStrategyTokens(strategy) as slug}
					{@const symbol = slug.toUpperCase()}
					<Tooltip>
						<svelte:fragment slot="trigger">
							<EntitySymbol type="token" size="2.5rem" {slug} />
						</svelte:fragment>

						<span slot="popup">This strategy trades <strong>{symbol}</strong></span>
					</Tooltip>
				{/each}
			</div>
		</div>
		<div class="chart">
			<svg width="683" height="240" viewBox="0 0 683 240" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_330_107233)">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M-382 240L-382 142.611L-369.333 151.012L-356.667 144.291L-344 131.896L-331.333 117.569L-318.667 118.653L-306 137.931L-293.333 140.93L-280.667 121.363L-268 108.553L-255.333 106.836L-242.667 97.3868L-230 74.0069L-217.333 80.8908L-204.667 81.1618L-192 93.3938L-179.333 69.6706L-166.667 81.0895L-154 97.2061L-141.333 87.341L-128.667 91.8219L-116 110.197L-103.333 104.993L-90.6667 98.3082L-78 99.5007L-65.3333 93.5022L-52.6666 87.2868L-40 78.1625L-27.3333 64.6838L-14.6667 80.3668L-2 84.1611L10.6667 102.97L23.3334 96.4292L36 106.728L48.6667 122.176L61.3334 140.388L74 136.648L86.6667 165.232L99.3333 163.624L112 176.56L124.667 182.487L137.333 167.797L150 154.319L162.667 154.373L175.333 144.128L188 136.739L200.667 151.428L213.333 166.207L226 173.796L238.667 153.271L251.333 137.841L264 130.433L276.667 141.183L289.333 98.1818L302 92.3639L314.667 95.9233L327.333 108.643L340 90.3584L352.667 108.065L365.333 97.5855L378 97.4952L390.667 93.7371L403.333 80.6559L416 84.9741L428.667 90.3945L441.333 89.744L454 89.2923L466.667 80.5656L479.333 91.4424L492 97.3326L504.667 83.3661L517.333 87.7746L530 97.5674L542.667 107.288L555.333 114.732L568 105.879L580.667 103.06L593.333 87.594L606 89.455L618.667 64.9729L631.333 64.196L644 55.4512L656.667 36.263L669.333 35.3054L682 38.4673L694.667 47.6277L707.333 57.2941L720 48.9286L732.667 71.7123L745.333 74.567L758 72.5073L770.667 63.6901L783.333 67.6651L796 52.217L808.667 29.4153L821.333 46.6701L834 33.3541L846.667 24.808L872 3V240"
						fill="url(#paint0_linear_330_107233)"
					/>
					<path
						d="M-382 240L-382 142.611L-369.333 151.012L-356.667 144.291L-344 131.896L-331.333 117.569L-318.667 118.653L-306 137.931L-293.333 140.93L-280.667 121.363L-268 108.553L-255.333 106.836L-242.667 97.3868L-230 74.0069L-217.333 80.8908L-204.667 81.1618L-192 93.3938L-179.333 69.6706L-166.667 81.0895L-154 97.2061L-141.333 87.341L-128.667 91.8219L-116 110.197L-103.333 104.993L-90.6667 98.3082L-78 99.5007L-65.3333 93.5022L-52.6666 87.2868L-40 78.1625L-27.3333 64.6838L-14.6667 80.3668L-2 84.1611L10.6667 102.97L23.3334 96.4292L36 106.728L48.6667 122.176L61.3334 140.388L74 136.648L86.6667 165.232L99.3333 163.624L112 176.56L124.667 182.487L137.333 167.797L150 154.319L162.667 154.373L175.333 144.128L188 136.739L200.667 151.428L213.333 166.207L226 173.796L238.667 153.271L251.333 137.841L264 130.433L276.667 141.183L289.333 98.1818L302 92.3639L314.667 95.9233L327.333 108.643L340 90.3584L352.667 108.065L365.333 97.5855L378 97.4952L390.667 93.7371L403.333 80.6559L416 84.9741L428.667 90.3945L441.333 89.744L454 89.2923L466.667 80.5656L479.333 91.4424L492 97.3326L504.667 83.3661L517.333 87.7746L530 97.5674L542.667 107.288L555.333 114.732L568 105.879L580.667 103.06L593.333 87.594L606 89.455L618.667 64.9729L631.333 64.196L644 55.4512L656.667 36.263L669.333 35.3054L682 38.4673L694.667 47.6277L707.333 57.2941L720 48.9286L732.667 71.7123L745.333 74.567L758 72.5073L770.667 63.6901L783.333 67.6651L796 52.217L808.667 29.4153L821.333 46.6701L834 33.3541L846.667 24.808L872 3V240"
						stroke="#22B554"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</g>
				<defs>
					<linearGradient
						id="paint0_linear_330_107233"
						x1="245"
						y1="3"
						x2="245"
						y2="240"
						gradientUnits="userSpaceOnUse"
					>
						<stop stop-color="#22B554" stop-opacity="0.3" />
						<stop offset="1" stop-color="#22B554" stop-opacity="0" />
					</linearGradient>
					<clipPath id="clip0_330_107233">
						<rect width="683" height="240" fill="white" />
					</clipPath>
				</defs>
			</svg>
		</div>
	</div>
	<div class="content">
		<header>
			<div class="avatar">
				<img src={strategy.icon_url} alt={strategy.name} />
				<div class="chain-icon">
					<Tooltip>
						<svelte:fragment slot="trigger">
							<EntitySymbol slug={getChainSlug(strategy?.on_chain_data?.chain_id)} type="blockchain" />
						</svelte:fragment>
						<span slot="popup">
							This strategy runs on <strong>{getChainSlug(strategy?.on_chain_data?.chain_id)}</strong> blockchain
						</span>
					</Tooltip>
				</div>
			</div>
			<div class="description">
				<h3>{strategy.name}</h3>
				<p>{strategy.short_description}</p>
			</div>
		</header>
		<div class="data">
			<StrategyDataSummary {backtestLink} {strategy} />

			{#if isBacktested}
				<span class="backtest-data-badge">Backtested Metrics*</span>
			{/if}
		</div>
		<div class="actions">
			<Button size="lg" bind:thisButton={ctaButton}>View strategy</Button>
		</div>
	</div>
</a>

<style lang="postcss">
	@import './css/radius-new.css';

	.strategy-tile {
		background: hsla(var(--hsla-box-1));
		border: 1px hsla(var(--hsla-box-3)) solid;
		border-radius: var(--radius-lg);
		color: hsla(var(--hsl-text));
		text-decoration: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(90vw, 24rem), 1fr));
		transition: var(--transition-1);

		&:hover {
			background: hsla(var(--hsla-box-2));
			z-index: 9999999;
		}

		& .visuals {
			padding-top: 2rem;
			display: grid;
			position: relative;

			& .top {
				align-items: flex-start;
				display: flex;
				gap: 1rem;
				justify-content: space-between;
				padding: 1rem;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;

				& .tokens {
					display: flex;
					gap: 0.5rem;

					& :global(.entity-symbol) {
						border-radius: 100%;
						box-shadow: var(--shadow-1);
					}
				}
			}

			& .chart {
				z-index: -1;
				& svg {
					width: 100%;
					height: 100%;
				}
			}
		}

		& .content {
			container-type: inline-size;
			display: grid;
			gap: 0.75rem;
			padding: 1.5rem;
			@media (--viewport-sm-down) {
				padding: 1rem;
			}

			& header {
				--avatar-size: 6rem;
				@media (--viewport-sm-down) {
					--avatar-size: 4.75rem;
				}
				align-items: center;
				display: grid;
				grid-template-columns: 6rem auto;
				gap: 1.5rem;

				& .avatar {
					background: hsla(var(--hsla-box-3));
					border-radius: 100%;
					font: var(--f-ui-sm-roman);
					text-align: center;
					display: grid;
					height: var(--avatar-size);
					position: relative;
					width: var(--avatar-size);

					& :global(.tooltip .popup) {
						min-width: 20rem;
					}

					& img {
						border-radius: 100%;
						height: 100%;
						object-fit: cover;
						overflow: hidden;
						width: 100%;
						display: grid;
						place-items: center;
					}

					& .chain-icon {
						border-radius: 100%;
						bottom: -0.5rem;
						box-shadow: var(--shadow-1);
						background: hsla(var(--hsl-white));
						display: flex;
						padding: 0.25rem;
						position: absolute;
						right: -0.5rem;

						& strong {
							text-transform: capitalize;
						}
					}
				}

				& .description {
					align-items: center;
					justify-items: start;
					display: grid;
					gap: 0.25rem;

					& :where(h3, p) {
						margin: 0;
					}
				}

				& h3 {
					font: var(--f-ui-xxl-medium);

					@container (width <= 420px) {
						font: var(--f-ui-xl-medium);
					}

					@container (width <= 332px) {
						font: var(--f-ui-lg-medium);
					}
				}

				& p {
					font: var(--f-ui-md-medium);
					color: hsla(var(--hsl-text-extra-light));
				}
			}

			& .data {
				position: relative;
			}

			& .backtest-data-badge {
				align-items: center;
				border-radius: var(--radius-sl);
				color: hsla(var(--hsl-text-extra-light));
				display: inline-flex;
				font: var(--f-ui-xs-bold);
				gap: 0.625rem;
				justify-content: center;
				margin-block: 0.25rem 0.75rem;
				text-transform: uppercase;
			}

			& .actions {
				display: grid;
			}
		}

		& :global(.strategy-data-summary) {
			margin-block: 1.25rem;
			@media (--viewport-sm-down) {
				margin-block: 0.75rem;
			}
		}
	}
</style>
