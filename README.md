
[![NPM version][npm-image]][npm-url]

# CILint

CILint是一个团队开发代码检查工具，进行检查时只关注新增行.

- 使用[ESLint](http://eslint.org/)检查javascript的语法
- 使用Git的Hook在团队中推行

## Installation and Usage

可以本地安装和全局安装

### 本地安装

```
$ npm install cilint --save-dev
```

生成配置文件:

- 生成`.cilintrc.js`
- 生成`.eslintrc.js`
- 向`.git/hooks`注入pre-commit的钩子

```
$ ./node_modules/.bin/cilint --init
```

之后你可以对任意文件或者目录运行CILint:

```
$ ./node_modules/.bin/cilint yourfile.js
```

在`git commit`时`.git/hooks/pre-commit`将自动执行, 存在error时将阻止本次提交并提示错误

### 全局安装

如果你希望在多个项目中使用，我们推荐你使用全局安装:

```
$ npm install -g cilint
```

生成配置文件:

```
$ cilint --init
```

运行CILint:

```
$ cilint yourfile.js
```

### 团队规范执行

1、在`package.json`中声明CILint的依赖:

```json
{
  "devDependencies": {
    "cilint": "*"
  }
}
```

2、在构建文件`webpack.config.js`或`gulpfile.js`、`fis-conf.js`中引入如下代码执行init:

```javascript
// 等同于`cilint --init`
require('cilint').initializer();
```

## Configuring 

`.cilintrc.js`配置

- stopCommit `Boolean` `default` `true` 存在error时是否阻止commit
- ignore `Array.<String>` `default` `[]` 代码检查忽略列表

`.eslintrc.js`配置

参考http://eslint.org/docs/user-guide/configuring

## ESLint Rules

- [eslint](http://eslint.org/docs/rules/)
- [airbnb](https://github.com/airbnb/javascript)
- [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules)
- [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import#rules)
- [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y#supported-rules)

## FAQ


[npm-image]: https://img.shields.io/npm/v/cilint.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/cilint
