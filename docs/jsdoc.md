# JSDoc Documentation Generation

This project uses JSDoc to generate API-level and function-level documentation for all backend and frontend JavaScript code.

## How to Generate Documentation

1. **Install JSDoc (if not already installed):**
   ```sh
   npm install -g jsdoc
   ```
   Or as a dev dependency:
   ```sh
   npm install --save-dev jsdoc
   ```

2. **Run JSDoc:**
   From the project root, run:
   ```sh
   npx jsdoc server/src/**/*.js client/src/**/*.js -c client/jsdoc.config.json -d client/docs/jsdoc
   ```
   - This will generate HTML documentation in `client/docs/jsdoc/` using the config in `client/jsdoc.config.json`.
   - You can adjust the source and output paths as needed.

3. **View Documentation:**
   Open `client/docs/jsdoc/index.html` in your browser to view the generated docs.

## Notes
- All exported functions and route handlers are documented with JSDoc comments.
- For API-level docs, see the Swagger UI at `/docs` (backend).
- For frontend services, see `client/src/services/api.js` and related files.

## Regeneration
- Re-run the above command after code changes to update documentation.

---
For more details, see [JSDoc documentation](https://jsdoc.app/) or the config file at `client/jsdoc.config.json`.
