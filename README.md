# gentle-fs [![npm version](https://img.shields.io/npm/v/gentle-fs.svg)](https://npm.im/gentle-fs) [![license](https://img.shields.io/npm/l/gentle-fs.svg)](https://npm.im/gentle-fs) [![Travis](https://img.shields.io/travis/npm/gentle-fs.svg)](https://travis-ci.org/npm/gentle-fs) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/npm/gentle-fs?svg=true)](https://ci.appveyor.com/project/npm/gentle-fs) [![Coverage Status](https://coveralls.io/repos/github/npm/gentle-fs/badge.svg?branch=latest)](https://coveralls.io/github/npm/gentle-fs?branch=latest)

[`gentle-fs`](https://github.com/npm/gentle-fs) is a standalone library for
"gently" remove or link directories.

## Install

`$ npm install gentle-fs`

## Table of Contents

* [Example](#example)
* [Features](#features)
* [Contributing](#contributing)
* [API](#api)
  * [`rm`](#rm)
  * [`link`](#link)
  * [`linkIfExists`](#linkIfExists)

### Example

```javascript
// todo
```

### Features

* TODO

### Contributing

The npm team enthusiastically welcomes contributions and project participation!
There's a bunch of things you can do if you want to contribute! The [Contributor
Guide](CONTRIBUTING.md) has all the information you need for everything from
reporting bugs to contributing entire new features. Please don't hesitate to
jump in if you'd like to, or even ask us questions if something isn't clear.

### API

#### <a name="rm"></a> `> rm(target, [opts]) -> Promise`

##### Example

```javascript
rm(target, opts)
```

#### <a name="link"></a> `> link(from, to, [opts]) -> Promise`

##### Example

```javascript
link(from, to, opts)
```

#### <a name="linkIfExists"></a> `> linkIfExists(from, to, [opts]) -> Promise`

##### Example

```javascript
linkIfExists(from, to, opts)
```
