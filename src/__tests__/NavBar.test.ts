import {render, fireEvent} from '@testing-library/svelte';
import NavBar from '../components/header/Navbar.svelte';

describe('Exchanges Page', () => {
  it('shows proper heading when rendered exchanges page', () => {
    const {getByText} = render(NavBar, { });
    expect(() => getByText("Documentation")).not.toThrow();
  })
})
