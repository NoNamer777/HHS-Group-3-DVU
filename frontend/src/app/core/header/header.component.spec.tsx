import { BrowserRouter } from 'react-router-dom';
import { render } from 'vitest-browser-react';
import HeaderComponent from './header.component';

test('Navbar', async () => {
    const { getByText } = await render(
        <BrowserRouter>
            <HeaderComponent />
        </BrowserRouter>,
    );

    await expect.element(getByText('Inloggen')).toBeInTheDocument();
});
