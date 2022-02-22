<!--

  Sveltestrap Navbar did not work with our theme, as it changes some core Bootstrap CSS rules.
  We have now in-house hacked together navbar.

-->

<script lang="ts">

  import Search from '../search/Search.svelte';
  import logo from '../../lib/assets/logo-two-lines-new-no-text.svg';
  import twitter from './twitter.svg';
  import telegram from './telegram.svg';
  import discord from './discord.svg';

  let isOpen = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  function clickCollapse(e) {
      console.log("Clicked collapse", e);
      isOpen = !isOpen;
  }

  function handleDropdownToggle(e) {

      const toggler = e.target.closest(".nav-link");

      const toggleId = toggler.getAttribute("data-toggle");

      //console.log("Toggle element is", e.target, toggler, toggleId);
      //console.log(e.target.parentNode);
      //console.log(toggleId);

      const menu = document.getElementById(toggleId);
      // const menu = e.target.closest(".dropdown");
      const navBar = menu.closest(".navbar");

      console.log("Navbar is", navBar, "menu is", menu);

      if(menu.classList.contains("show")) {
          // Close menu
          menu.classList.toggle("show");
      } else {
        // Open this menu, close others
        // https://stackoverflow.com/a/61773683/315168
        Array.from(navBar.querySelectorAll('.show')).forEach((el) => el.classList.remove('show'));
        menu.classList.add("show");
      }

      return true;
  }
</script>

<!-- Navbar -->
<div class="container" data-testid={'navbar'}>
  <nav class="navbar navbar-expand-lg navbar-light white scrolling-navbar">

      <!-- Brand -->
      <a class="navbar-brand" href="/" data-cy="logo">
        <img class="img-logo img-logo-desktop" src={logo} alt="Trading Strategy" />
        <img
            class="img-logo img-logo-mobile"
            src={logo}
            alt="Trading Strategy"
            width="128"
            height="40"
            />
      </a>

      <!-- Collapse -->
      <button
              class="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
              on:click={clickCollapse}
        >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Links -->
      <div class="collapse navbar-collapse" class:show={isOpen} id="navbarSupportedContent">

        <!-- Left -->
        <ul class="navbar-nav mr-auto" data-cy="navigation">
          <li class="nav-item" data-testid={'navigation-link'}>
            <a rel="external" class="nav-link" href="/trading-view">Trading data</a>
          </li>

          <li class="nav-item" data-testid={'navigation-link'}>
            <a rel="external" class="nav-link" href="/about">About</a>
          </li>

          <li class="nav-item" data-testid={'navigation-link'}>
            <a rel="external" class="nav-link" href="https://tradingstrategy.ai/docs/index.html">Documentation</a>
          </li>

          <li class="nav-item" data-testid={'navigation-link'}>
            <a rel="external" class="nav-link" href="/community">Community</a>
          </li>

          <li class="nav-item" data-testid={'navigation-link'}>
            <a rel="external" class="nav-link" href="/blog">Blog</a>
          </li>

          <li class="nav-item nav-item-mobile-only">
            <a href="https://twitter.com/tradingprotocol" class="nav-link">
              <img src={twitter} loading="lazy"  alt="Twitter" /> <span class="mobile-text">Twitter</span>
            </a>
          </li>

          <li class="nav-item nav-item-mobile-only">
            <a href="https://discord.gg/en8tW6MDtw" class="nav-link">
              <img src={discord} loading="lazy" alt="Discord" /> <span class="mobile-text">Discord</span>
            </a>
          </li>

          <li class="nav-item nav-item-mobile-only">
            <a href="https://t.me/trading_protocol" class="nav-link">
              <img src={telegram} loading="lazy" alt="Telegram" /> <span class="mobile-text">Telegram</span>
            </a>
          </li>
        </ul>

        <Search />

        <!-- Right -->
        <ul class="navbar-nav nav-flex-icons">
          <li class="nav-item nav-item-right">
            <a href="https://twitter.com/tradingprotocol" class="nav-link">
              <img src={twitter} loading="lazy" alt="Twitter"/>
            </a>
          </li>

          <li class="nav-item nav-item-right">
            <a href="https://discord.gg/en8tW6MDtw" class="nav-link">
              <img src={discord} loading="lazy" alt="Discord" />
            </a>
          </li>

          <li class="nav-item nav-item-right">
            <a href="https://t.me/trading_protocol" class="nav-link">
              <img src={telegram} loading="lazy" alt="Telegram"/>
            </a>
          </li>
        </ul>

      </div>
  </nav>
</div>

<style>
    .nav-item-mobile-only {
        display: none;
    }

    /* Fix left aligment issues */
    .navbar {
      padding: 5px;
    }

    .nav-link {
        white-space: nowrap;
    }

    /* SVG icons */
    .nav-item a img {
        width: 28px;
        height: 28px;
        opacity: 1;
    }

    .nav-item a:hover img {
        opacity: 0.5;
    }

    .nav-link:hover {
        color: var(--price-up-green) !important;
    }

    .img-logo {
        height: 32px;
    }

    .img-logo-mobile {
      display: none;
    }

    .dropdown-menu.disabled {
        color: #aaa;
        cursor: not-allowed;
    }

	/* Switch logos */
	@media (max-width: 992px) {
      .img-logo-mobile { display: block }
      .img-logo-desktop { display: none }
      .nav-item {
          margin-bottom: 10px;
      }
      .nav-item-mobile-only { display: block }
      .nav-item-mobile-only a { display: block }
      .nav-item-right { display: none }
	}

    .navbar-toggler {
        z-index: 2000;
    }

    .nav-item-right {
        margin-right: 0;
    }

    .nav-item-right .nav-link {
        padding-right: 0;
    }

    .nav-item-right .nav-link:hover {
        color: var(--price-up-green);
    }

    .nav-item-right .nav-link i {
        font-size: 1.4rem;
    }
</style>
