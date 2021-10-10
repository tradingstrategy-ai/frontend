<script>
	import PoolPreview from '$lib/pool/PoolPreview.svelte';
	import '$lib/styles/bodytext.css';
	import ElevatorPitch from '$lib/content/ElevatorPitch.svelte';
</script>

<svelte:head>
	<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>
	<meta name="description" content="On-chain systematic investing and trading">
</svelte:head>



<style>

	main {
		min-height: 100vw;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	.card-jumbo {
		background: #F2DFCE;
		box-shadow: none;
		padding: 60px 0;
	}

	.card-jumbo p {
		text-align: center;
	}

	h1 {
		width: 100%;
		color: black;
		text-align: center;
	}
	.pool-preview :global(.card) {
		margin: 60px 0;
	}

	.network-status {
		margin: 60px 0;
		background: #80DEEA;
		padding: 60px 0;
	}

	.learn-more {
		padding-bottom: 60px;
	}

	.image-wrapper {
	  display: flex;
	  align-items: center;
	  height: 100%;
	}

	svg {
		max-height: 160px;
		margin: 0 auto;
	}

	@media(max-width: 768px) {
		svg {
			display: none;
		}
	}

	.pulse {
	  display: inline-block;
	  width: 16px;
	  height: 16px;
	  border-radius: 50%;
	  background: #f0f0f0;
	  cursor: pointer;
	  box-shadow: 0 0 0 rgba(255,255,255, 0.4);
	  animation: pulse 2s infinite;
	}
	.pulse:hover {
	  animation: none;
	}

	@-webkit-keyframes pulse {
	  0% {
		-webkit-box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.4);
	  }
	  70% {
		  -webkit-box-shadow: 0 0 0 10px rgba(0,0,255, 0);
	  }
	  100% {
		  -webkit-box-shadow: 0 0 0 0 rgba(0,0,255, 0);
	  }
	}
	@keyframes pulse {
	  0% {
		-moz-box-shadow: 0 0 0 0 rgba(0,0,255, 0.4);
		box-shadow: 0 0 0 0 rgba(0,0,255, 0.4);
	  }
	  70% {
		  -moz-box-shadow: 0 0 0 10px rgba(0,0,255, 0);
		  box-shadow: 0 0 0 10px rgba(0,0,255, 0);
	  }
	  100% {
		  -moz-box-shadow: 0 0 0 0 rgba(0,0,255, 0);
		  box-shadow: 0 0 0 0 rgba(0,0,255, 0);
	  }
	}
</style>
