import '@testing-library/jest-dom';
import {render, fireEvent} from '@testing-library/svelte';
import exchanges from './exchanges.svelte';

describe('Exchanges Page', () => {
  it('shows proper heading when rendered exchanges page', () => {
    const {getByText} = render(exchanges, { });
    expect(getByText('Exchanges')).toBeInTheDocument();
  })
  
  it('testing that a typo exchange word is not in the page', () => {
    const {queryByText} = render(exchanges, { });
    expect(queryByText('Exchanses')).toBeNull();
  })
})

