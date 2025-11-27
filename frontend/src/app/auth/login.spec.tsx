import { render } from 'vitest-browser-react';
import Login from './login.tsx';

test('Login', async () => {
    const { getByText } = await render(<Login />);

    await expect.element(getByText('Hello Oscar')).toBeInTheDocument();
});
