import typescriptLogo from '/typescript.svg';
import viteLogo from '/vite.svg';

export default function Home() {
    return (
        <main>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://vite.dev" target="_blank">
                    <img
                        src={typescriptLogo}
                        className="logo"
                        alt="Typescript logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <h1>Hello Home</h1>
        </main>
    );
}
