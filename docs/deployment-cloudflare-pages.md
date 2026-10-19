# Deploying to Cloudflare Pages

This repository is a plain static website; no framework build is required.

1. Push the repository to GitHub.
2. In Cloudflare, open **Workers & Pages** and create a Pages project connected to the repository.
3. Select `main` as the production branch.
4. Build command: leave blank if supported, otherwise use `exit 0`.
5. Build output directory: `/` or `.` depending on the dashboard's validation; `index.html` must remain at the project root.
6. Deploy and test the public URL, privacy page, calculator, keyboard navigation and mobile layout.
7. After connecting Git integration, pushes to the production branch trigger deployments.

The current project does not require Node.js to serve the website. Node.js is used only to run local/CI tests.
