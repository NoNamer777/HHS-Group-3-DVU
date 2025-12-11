import { BrowserRouter } from 'react-router-dom';
import { render } from 'vitest-browser-react';
import Navbar from './navbar.tsx';

test('Navbar', async () => {
    const { getByText } = await render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>,
    );

    await expect.element(getByText('Diabeticum Pedis')).toBeInTheDocument();
});
