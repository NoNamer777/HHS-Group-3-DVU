import { render } from 'vitest-browser-react';
import LoginPage from './login.page.tsx';

test('Login', async () => {
    const { getByText } = await render(<LoginPage />);

    await expect.element(getByText('Inloggen')).toBeInTheDocument();
});
