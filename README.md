# ng-lion-ts-auth

A fork of ng-lion-typescript boilerplate. Added the example authentication based on JWT (JSON Web Tokens).

Features:
- TypeScript (!!!)
- Angular 1.4
- UI-router
- Karma
- Gulp
- Browserify
- LESS
- Skeleton CSS
- JWT (JSON Web Tokens)

## How to install?

First, you need tsd and gulp installed globally:
```
$ sudo npm i -g tsd
$ sudo npm i -g gulp
```

Then, run:
```
$ npm install
$ tsd install
```

And finally (it will run the tests!):
```
$ gulp build
```

or, to trigger the browserify + watchify without running the tests:
```
$ gulp build.dev
```

The authentication token max age is currently 30 seconds (for demonstration purposes; that can be changed in server.js).

## Credits
Written in Visual Studio Code, which I highly recommend ;-)