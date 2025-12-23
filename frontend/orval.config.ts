import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        // point to the actual OpenAPI JSON/YAML endpoint or a local file
        input: {
            target:
                process.env.OPENAPI_URL || `http://localhost:8000/openapi.json`,
        },
        output: {
            mode: 'split',
            // directory for split mode
            target: './src/api/fetchers.ts',
            client: 'react-query',
            // optional: enable prettier formatting
            prettier: true,
            override: {
                mutator: {
                    path: './src/api/instance.ts',
                    name: 'customInstance',
                },
            },
            // optional: if the spec is protected, you can set headers:
            // headers: { Authorization: `Bearer ${process.env.OPENAPI_TOKEN}` }
            // or override fetcher (mutator) to use your own fetch wrapper:
            // override: { mutator: { path: "./src/api/fetcher.ts", name: "fetcher" } }
        },
    },
});