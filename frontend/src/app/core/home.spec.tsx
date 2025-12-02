import { render } from 'vitest-browser-react';
import Home from './home.tsx';

test('Home', async () => {
    const { getByText } = await render(<Home />);

    await expect.element(getByText('Hello Home')).toBeInTheDocument();
});
