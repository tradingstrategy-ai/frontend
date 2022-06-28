<!--

Footer.

We don't do footers here. Thus, this only is displayed on mobile and has social media links.

-->
<script lang="ts">
	import twitter from './twitter.svg';
	import telegram from './telegram.svg';
	import discord from './discord.svg';
</script>

<ul>
	<li>
		<a href="https://discord.gg/en8tW6MDtw">
			<img src={discord} loading="lazy" alt="Discord" />
		</a>
	</li>

	<li>
		<a href="https://twitter.com/tradingprotocol">
			<img src={twitter} loading="lazy" alt="Twitter" />
		</a>
	</li>

	<li>
		<a href="https://t.me/trading_protocol">
			<img src={telegram} loading="lazy" alt="Telegram" />
		</a>
	</li>
</ul>

<style>
	ul {
		display: block;
		margin: 1rem auto;
		padding: 0;
		text-align: center;
	}

	li {
		display: inline;
		margin: 0 1rem;
	}

	/* SVG icons */
	a img {
		width: 28px;
		height: 28px;
		opacity: 1;
	}

	a:hover img {
		opacity: 0.5;
	}
</style>
