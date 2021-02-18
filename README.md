# Ornn

LOL Community Management Bot Service for Whipping Cream

## Description

Kakaotalk bot + API Server

## Installation

```bash
# install npm package
$ yarn

# create development environment file (set your database config)
$ cp .env/default.env .env/development.env
```

## Running the app

```bash
# development
$ yarn start

# production mode
$ yarn start:prod
```

## Register Device on Kakaotalk Server

```bash
$ yarn device:register
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Built With

- [NestJS](https://expressjs.com/en/starter/installing.html)
- [TypeORM](https://expressjs.com/en/starter/installing.html)

## Chat Integration

- [KakaoTalk](https://github.com/storycraft/node-kakao)
- [Discord](https://github.com/discordjs/discord.js)

## Authors

- [8eatles](https://8eatles.github.io)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
