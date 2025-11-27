import { render } from "vitest-browser-react";
import Navbar from "./navbar.tsx";
import {BrowserRouter} from "react-router-dom";

test('Navbar', async () => {
    const { getByText } = await render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    );

    await expect.element(getByText('Inloggen')).toBeInTheDocument();
});
