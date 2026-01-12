# README #

This README would normally document whatever steps are necessary to get your application up and running.

# NestJS Project Starter

A progressive [Node.js](http://nodejs.org) framework for building efficient and scalable server-side applications.

## Prerequisites

Ensure you have the following installed on your local machine:
* **Node.js** (LTS version recommended)
* **npm** (Node Package Manager)

## Project Setup

Install the project dependencies:

```bash
$ npm install
```

## Run docker containers: postgresdb and redisdb, Go to root dir and run 
```bash
$ docker network create app-network

$ docker compose up -d
```

## To run the project 
```bash
$ npm run start:dev
```


## To run the tests 
```bash
$ npm run test
```

## e2e tests
```bash
$ npm run test:e2e
```