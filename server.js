import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
});
app.use(vite.middlewares);
app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
        const appHtml = await render(url);
        const html = template
            .replace(`<!--app-head-->`, appHtml.head ?? '')
            .replace(`<!--app-html-->`, appHtml.html ?? '');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    }
    catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
    }
});
app.listen(3000, () => {
    console.log('Listening on :3000');
});
