# Budget First

[![Dependency Status](https://david-dm.org/jannschu/BudgetFirst/dev-boilerplate.svg)](https://david-dm.org/jannschu/BudgetFirst/dev-boilerplate)
[![devDependency Status](https://david-dm.org/jannschu/BudgetFirst/dev-boilerplate/dev-status.svg)](https://david-dm.org/jannschu/BudgetFirst/dev-boilerplate/#info=devDependencie)

Budget First is an open source budget application based on the envelope budgeting or zero-sum budget approach, in which income is partitioned in various categories and spending only occurs from these categories.

It is currently in development. To check out or help contribute to the planning discussion, please visit the [Google Group](https://groups.google.com/forum/#!forum/budget-first) or [/r/budgetfirst](https://www.reddit.com/r/budgetfirst/)!

## Development

The app is written in [TypeScript](http://www.typescriptlang.org) which compiles to JavaScript. It runs in [Electron](http://electron.atom.io) using the [React framework](http://facebook.github.io/react/) with [Redux](http://redux.js.org). Tests are run with [mocha](http://mochajs.org) (and [should.js](http://shouldjs.github.io)).

### Workflow

After cloning do
```
npm install
```
We use the hot-loading mechanism of _webpack_ and _react_. Run
```
npm run hot-server
```
and in a new tab
```
npm run hot-electron
```

### Notes
- If you have added a new TypeScript file, call `npm run create-tsconfig` to create a new `.tsconfig`.
- Consider using [EditorConfig](http://editorconfig.org/#download).

### TODO (for development environment)

- CSS/Images boilerplate (with webpack)
- CI
- License, authors, description
