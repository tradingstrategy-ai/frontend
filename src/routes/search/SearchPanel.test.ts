import { render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SearchPanel from './SearchPanel.svelte';

describe('SearchPanel component', () => {
	test('should lose focus when "Enter" key is pressed', async () => {
		const user = userEvent.setup();
		const searchBox = render(SearchPanel).getByRole('searchbox');
		searchBox.focus();

		await user.keyboard('eth');
		expect(searchBox).toHaveFocus();

		await user.keyboard('{Enter}');
		expect(searchBox).not.toHaveFocus();
	});
});
