import { BrowserRouter } from 'react-router-dom';
import { render } from 'vitest-browser-react';
import App from './app';

test('App', async () => {
    const { getByText } = await render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
    );

    await expect.element(getByText('Hello World')).toBeInTheDocument();
});
