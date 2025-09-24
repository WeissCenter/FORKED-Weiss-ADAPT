# Contributing to Our Project

This project uses **Nx** and **Angular**, and we encourage contributors to follow **best practices** based on guidelines from Google’s Angular and Nx documentation. Please read the following guide to ensure your contributions align with the project's standards.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Code of Conduct](#code-of-conduct)
3. [How to Contribute](#how-to-contribute)
4. [Branching Strategy](#branching-strategy)
5. [Commit Guidelines](#commit-guidelines)
6. [Code Style](#code-style)
7. [Pull Requests](#pull-requests)
8. [Resources](#resources)

## Getting Started

To start contributing, ensure you have the following set up:

1. **Node.js** (LTS version)
2. **Nx CLI**: Install via `npm install -g nx`
3. **Angular CLI**: Install via `npm install -g @angular/cli`

Clone the repository:

```bash
git clone https://github.com/WeissCenter/Weiss-ADAPT.git
cd Weiss-ADAPT
npm install
```

Run the project locally:

```bash
nx serve
```

## Code of Conduct

By contributing, make sure to read and adhere to the guidelines.

## How to Contribute

We welcome various types of contributions:

- Bug fixes
- New features
- Documentation improvements
- Performance optimizations

Before you start working on a significant change, please create an issue describing your work to get feedback and avoid duplicate efforts.

## Branching Strategy

We follow the Gitflow workflow:

- `main`: Production-ready code
- `dev`: Active development branch
- `feature/feature-name`: New features
- `bugfix/bugfix-name`: Bug fixes

To contribute:

1. Create a new branch off of the `main` branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test them locally or in your own environment.
3. Push your branch and open a pull request against `dev`.

## Commit Guidelines

We follow **Conventional Commits** to structure commit messages. Use the following format:

```php
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Examples:

- `feat(login): add user authentication`
- `fix(dashboard): resolve widget load issue`

Types include:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `test`: Adding tests

## Code Style

We follow Google’s TypeScript style guide along with Angular and Nx best practices. Code should be formatted using prettier before pushing changes:

```bash
prettier . --write
```

## Pull Requests

When submitting a pull request:

1. Ensure your branch is up to date with `dev`.
2. Include clear and detailed descriptions of your changes.
3. Follow the pull request template.

We will review your pull request and provide feedback if necessary. Please address any feedback and update the pull request accordingly.

## Resources

Here are some useful resources for Angular and Nx development:

- [Nx Documentation](https://nx.dev/)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

Thank you again for contributing to the project!
