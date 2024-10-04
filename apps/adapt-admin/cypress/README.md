# Testing with Cypress

Cypress is a next generation front end testing tool built for the modern web. It provides [end to end (e2e) testing](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) as well as [component testing](https://docs.cypress.io/guides/component-testing/overview).

## E2E Testing

We use the [cypress cucumber preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor/tree/master/docs) allowing for tests to be written using the [Gherkin syntax](https://cucumber.io/docs/gherkin/reference/#background).

## Defining new E2E tests using Gherkin syntax

1. Create a `*.feature` file in the `adapt/apps/adapt-admin/cypress/e2e` folder
2. Create a `*_steps.ts` file in the `adapt/apps/adapt-admin/cypress/support/step_definitions` folder
3. Follow the [docs](https://github.com/badeball/cypress-cucumber-preprocessor/blob/master/docs/cucumber-basics.md) for the cypress cucumber preprocessor

### Commands

Running the e2e tests using the CLI

```bash
CYPRESS_USERNAME={YOUR_USERNAME} CYPRESS_PASSWORD={YOUR_PASSWORD} nx e2e adapt-admin --baseUrl={BASE_URL}
```

Running the e2e tests in the interactive web browser

```bash
CYPRESS_USERNAME={YOUR_USERNAME} CYPRESS_PASSWORD={YOUR_PASSWORD} nx e2e adapt-admin --watch --baseUrl={BASE_URL}
```

## Component Testing

### Commands

Running the component tests using the CLI

```bash
nx component-test adapt-admin
```

Running the component tests in the interactive web browser

```bash
nx component-test adapt-admin --watch
```
