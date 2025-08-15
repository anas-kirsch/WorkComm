# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Docker (production build)

1. Copy `.env.example` to `.env` and adjust values (API_URL, socket URLs, STRIPE_PUBLIC_KEY).
2. Build the image:
	- docker build -t workcomm-frontend .
3. Run the container:
	- docker run --rm -p 8080:80 --env-file .env workcomm-frontend
4. Open http://localhost:8080

Environment handling:
- The build script reads `.env` and generates both `environment.ts` and `environment.development.ts` before compiling.
- Rebuild the image if you change any value in `.env` (static files are produced at build time).

Healthcheck:
- Dockerfile defines a simple HTTP healthcheck on `/` (expects 200).

Future improvement (optional):
- Add runtime-config pattern (env.js) to avoid rebuilds for URL changes.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
