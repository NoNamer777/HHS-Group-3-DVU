import { BrowserRouter } from 'react-router-dom';
import { render } from 'vitest-browser-react';
import Header from './header.tsx';

test('Navbar', async () => {
    const { getByText } = await render(
        <BrowserRouter>
            <Header />
        </BrowserRouter>,
    );

    await expect.element(getByText('Inloggen')).toBeInTheDocument();
});
