<script lang="ts">
	/*

    Sveltestrap Navbar component is broken many ways for submenus and everthing.
    This is hacked together attempt just to get something working.
    It was painful.

   */

	import {
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

	import HorribleCollapse from './HorribleCollapse.svelte';

	import logo from '../../lib/assets/logo-web-beta.svg';
	import logoMobile from '../../lib/assets/logo-two-lines.png';

	let isOpen = false;

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
	}
</script>

<!--
<div class="container">
    <Navbar color="light" light expand="md">
      <NavbarBrand href="/">sveltestrap</NavbarBrand>
      <NavbarToggler on:click={() => (isOpen = !isOpen)} />
      <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
        <Nav class="ml-auto" navbar>
          <NavItem>
            <NavLink href="#components/">Components</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="https://github.com/bestguy/sveltestrap">GitHub</NavLink>
          </NavItem>
          <Dropdown nav inNavbar>
            <DropdownToggle nav caret>Options</DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>Option 1</DropdownItem>
              <DropdownItem>Option 2</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Reset</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Collapse>
    </Navbar>
</div> -->

<div class="container hacky-navbar">
	<Navbar color="light" light expand="md">
		<a class="navbar-brand" href="/">
			<img class="img-logo img-logo-desktop" src={logo} alt="On-chain quantitative finance" />
			<img class="img-logo img-logo-mobile" src={logoMobile} alt="On-chain quantitative finance" />
		</a>
		<NavbarToggler on:click={() => (isOpen = !isOpen)} />
		<HorribleCollapse {isOpen} class={isOpen ? 'opened' : 'closed'} navbar expand="md" on:update={handleUpdate}>
			<Nav class="ms-auto" navbar>
				<Dropdown nav inNavbar>
					<DropdownToggle nav caret>Market data <span class="fas fa-angle-down nav-link-arrow ml-2" /></DropdownToggle>
					<DropdownMenu end>
						<DropdownItem disabled>Blockchains <span class="badge text-uppercase">Soon</span></DropdownItem>
						<DropdownItem disabled>Exchanges <span class="badge text-uppercase">Soon</span></DropdownItem>
						<DropdownItem disabled>Trading pairs <span class="badge text-uppercase">Soon</span></DropdownItem>
						<DropdownItem divider />
						<DropdownItem rel="external" href="https://tradingstrategy.ai/api/explorer/">Real-time API</DropdownItem>
						<DropdownItem rel="external" href="/datasets">Backtesting datasets</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown nav inNavbar>
					<DropdownToggle nav caret>Protocol <span class="fas fa-angle-down nav-link-arrow ml-2" /></DropdownToggle>
					<DropdownMenu end>
						<DropdownItem disabled>About <span class="badge text-uppercase">Soon</span></DropdownItem>
						<DropdownItem rel="external" href="https://tradingstrategy.ai/docs/index.html">Documentation</DropdownItem>
						<DropdownItem rel="external" href="https://tradingstrategy.ai/docs/protocol/comparison.html"
							>Comparison</DropdownItem
						>
						<DropdownItem
							rel="external"
							href="https://tradingstrategy.ai/docs/programming/examples/getting-started.html"
							>Create strategies</DropdownItem
						>
					</DropdownMenu>
				</Dropdown>

				<Dropdown nav inNavbar>
					<DropdownToggle nav caret>Community <span class="fas fa-angle-down nav-link-arrow ml-2" /></DropdownToggle>
					<DropdownMenu end>
						<DropdownItem disabled>Blog <span class="badge text-uppercase">Soon</span></DropdownItem>
						<DropdownItem rel="external" href="https://github.com/tradingstrategy-ai/">Github repository</DropdownItem>
						<DropdownItem rel="external" href="https://discord.gg/yReMpKykaS">Discord chat</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</Nav>
		</HorribleCollapse>
	</Navbar>
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
		.img-logo-mobile {
			display: block;
		}
		.img-logo-desktop {
			display: none;
		}
	}

	.hacky-navbar :global(.navbar) {
		background-color: #fff1e5 !important;
	}

	.hacky-navbar :global(.nav-link) {
		transition: none;
	}

	.hacky-navbar :global(.navbar-toggler) {
		z-index: 2000;
		background-color: #fff1e5;
	}

	@media (max-width: 960px) {
		.hacky-navbar :global(.navbar-collapse.opened) {
			background-color: #fff1e5;
			padding: 40px;
			box-shadow: 3px 3px 6px #ccbeb3, -3px -3px 6px #ccbeb3;
		}

		.hacky-navbar :global(.nav-link-arrow) {
			display: none;
		}
	}

	.hacky-navbar :global(.d-inline-flex) {
		display: block !important;
	}
</style>
