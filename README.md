[![CI](https://github.com/axelrindle/github-starred-index/actions/workflows/ci.yml/badge.svg)](https://github.com/axelrindle/github-starred-index/actions/workflows/ci.yml)
[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/axelrindle/github-starred-index?logo=docker)](https://hub.docker.com/r/axelrindle/github-starred-index)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/a47268802b464d99bea82318d82ab83f)](https://www.codacy.com/gh/axelrindle/github-starred-index/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=axelrindle/github-starred-index&amp;utm_campaign=Badge_Grade)

# Archived

Github introduced [their own list feature](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars#organizing-starred-repositories-with-lists) for organizing starred repositories, so this project is obsolete.

# github-starred-index

> :stars: A simple webservice that indexes your starred GitHub repositories.

## Requirements

- Node.js >= 14

- MongoDB >= 4

- A modern web browser (e.g. Firefox 88, Chrome 90)

### Features the web browser must support

- [Async functions](https://caniuse.com/async-functions)
- [Nullish Coalescing Operator](https://caniuse.com/mdn-javascript_operators_nullish_coalescing)
- [Dynamic imports](https://caniuse.com/es6-module-dynamic-import)

## Installation

### Manual

1. Clone the repository

2. Install dependencies

```shell
npm install
```

3. Compile source files

```shell
npm run compile:css
npm run compile:js
```

4. Start the server

```shell
node backend/main.js
```

### Docker Compose

Use the existing [docker-compose.yml](https://github.com/axelrindle/github-starred-index/blob/main/docker-compose.yml) as a template.

## Configuration

For detailed instructions, visit the [wiki](https://github.com/axelrindle/github-starred-index/wiki).

## License

[MIT](LICENSE)

## Copyright notices

- Github Logo &copy; GitHub, Inc.
- [Star Icon](https://www.iconfinder.com/icons/1679614/bright_christmas_decorate_decoration_favourite_light_star_icon) by [roundicons.com](https://roundicons.com/)
- Illustrations (see `static/css/img`) by [unDraw](https://undraw.co/)
