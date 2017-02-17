
[![NPM version][npm-image]][npm-url]

# CILint

CILint是一个团队开发代码检查工具，进行检查时只关注新增行.

- 使用[ESLint](http://eslint.org/)检查javascript的语法
- 使用Git的Hook在团队中推行

## Installation and Usage

可以本地安装和全局安装

### 本地安装

```sh
npm install cilint --save-dev
```

初始化配置:

```sh
./node_modules/.bin/cilint --init
```

初始化配置的工作包括:

- 生成`.cilintrc.js`
- 生成`.eslintrc.js`
- 向`.git/hooks`注入`pre-commit`的钩子

之后你可以对任意文件或者目录运行CILint:

```sh
./node_modules/.bin/cilint yourfile.js
```

在`git commit`时`.git/hooks/pre-commit`将自动执行, 存在error时将阻止本次提交并提示错误

### 全局安装

如果你希望在多个项目中使用，我们推荐你使用全局安装:

```sh
npm install -g cilint
```

生成配置文件:

```sh
cilint --init
```

运行CILint:

```sh
cilint yourfile.js
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
require('cilint').initializer({
    // override: true,
    // cilintrcUrl: 'https://',
    // eslintrcUrl: 'https://',
});
```

## Configuring 

### `.cilintrc.js`配置

- stopCommit `Boolean` `default` `true` 存在error时是否阻止commit
- ignore `Array.<String>` `default` `[]` 代码检查忽略列表

### `.eslintrc.js`配置

参考http://eslint.org/docs/user-guide/configuring

## API

### `cilint.initializer(options)`

初始化执行函数

#### Arguments

- `options` `Object`
- `options.override` `Boolean` `可选` `default` `false` 是否覆盖`.cilintrc.js`,`.eslintrc.js`等文件
- `options.cilintrc` `Object` `可选` cilintrc配置项
- `options.cilintrcUrl` `String` `可选` 从指定url拉取cilintrc配置项, 可以结合override = true使用
- `options.eslintrc` `Object` `可选` eslintrc配置项
- `options.eslintrcUrl` `String` `可选` 从指定url拉取eslintrc配置项, 可以结合override = true使用

## ESLint Rules

- [eslint](http://eslint.org/docs/rules/)
- [airbnb](https://github.com/airbnb/javascript)
- [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules)
- [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import#rules)
- [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y#supported-rules)

## FAQ

### CILint如何选择ESLint的？

CILint首先会以项目根目录require ESLint, 这有可能会require到项目下的node_modules/eslint或者全局的eslint, 如果没有将使用CILint/node_modules/ESLint

注意:
- ESLint和它的插件必须在同级node_modules下, 例如如果使用了全局的ESLint所有插件也必须全局安装
- 如果使用CILint下的ESLint部分插件并没有在CILint下

[npm-image]: https://img.shields.io/npm/v/cilint.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/cilint
