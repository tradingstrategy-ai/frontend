import '@testing-library/jest-dom';
import {render, fireEvent} from '@testing-library/svelte';
import Exchanges from '$routes/exchanges.svelte';

describe('Exchanges Page', () => {
  it('shows proper heading when rendered exchanges page', () => {
    const {getByText} = render(Exchanges, { });
    expect(getByText('Exchanges')).toBeInTheDocument();
  })
  
  it('testing that a typo exchange word is not in the page', () => {
    const {queryByText} = render(Exchanges, { });
    expect(queryByText('Exchanges')).toBeNull();
  })
})

