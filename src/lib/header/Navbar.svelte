<!--

  Sveltestrap Navbar did not work with our theme, as it changes some core Bootstrap CSS rules.
  We have now in-house hacked together navbar.

-->

<script lang="ts">

  import logo from '../../lib/assets/logo-web-beta.svg';
  import logoMobile from '../../lib/assets/logo-two-lines.png';

  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
  } from 'sveltestrap';

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

      console.log("Toggle element is", e.target, toggler, toggleId);
      console.log(e.target.parentNode);
      console.log(toggleId);

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
        <img class="img-logo img-logo-desktop" src={logo} alt="On-chain quantitative finance" />
        <img class="img-logo img-logo-mobile" src={logoMobile} alt="On-chain quantitative finance" />
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
      <div class="{'collapse navbar-collapse ' + (isOpen ? 'show' : '')}" id="navbarSupportedContent">

        <!-- Left -->
        <ul class="navbar-nav mr-auto">

            <li class="nav-item">
              <a class="nav-link" href="/trading-view">Trading data</a>
            </li>

            <li class="nav-item" data-testid={'navigation-link'}>
              <a rel="external" class="nav-link" href="/about">About</a>
            </li>

            <!-- <li class="nav-item">
              <a rel="external" class="nav-link" href="/exchanges">Exchanges</a>
            </li> -->

            <li class="nav-item" data-testid={'navigation-link'}>
              <a rel="external" class="nav-link" href="https://tradingstrategy.ai/docs/index.html">Docs</a>
            </li>

            <li class="nav-item" data-testid={'navigation-link'}>
              <a rel="external" class="nav-link" href="/community">Community</a>
            </li>

            <li class="nav-item" data-testid={'navigation-link'}>
              <a rel="external" class="nav-link" href="/blog">Blog</a>
            </li>

            <!--
            <li class="nav-item">
              <a class="nav-link waves-effect" href="https://capitalgram.com/blog">Blog</a>
            </li>
            -->
        </ul>

        <!-- Right -->
        <!--
        <ul class="navbar-nav nav-flex-icons">
          <li class="nav-item">
            <a href="https://twitter.com/moo9000" class="nav-link waves-effect" target="_blank">
              <i class="fab fa-twitter"></i> Twitter
            </a>
          </li>
        </ul>
        -->

      </div>
  </nav>
</div>

<style>

    /* Fix left aligment issues */
    .navbar {
      padding: 5px;
    }

    .img-logo {
        height: 36px;
    }

    .img-logo-mobile {
      display: none;
      max-width: 200px;
    }

    .dropdown-menu.disabled {
        color: #aaa;
        cursor: not-allowed;
    }

	/* Switch logos */
	@media (max-width: 960px) {
      .img-logo-mobile { display: block }
      .img-logo-desktop { display: none }
	}


    .navbar-toggler {
        z-index: 2000;
    }


</style>
