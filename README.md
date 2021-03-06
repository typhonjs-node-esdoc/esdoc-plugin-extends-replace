![esdoc-plugin-extends-replace](http://i.imgur.com/TSNfjDX.png)

[![NPM](https://img.shields.io/npm/v/esdoc-plugin-extends-replace.svg?label=npm)](https://www.npmjs.com/package/esdoc-plugin-extends-replace)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-esdoc/esdoc-plugin-extends-replace/blob/master/LICENSE)
[![Gitter](https://img.shields.io/gitter/room/typhonjs/TyphonJS.svg)](https://gitter.im/typhonjs/TyphonJS)

[![Build Status](https://travis-ci.org/typhonjs-node-esdoc/esdoc-plugin-extends-replace.svg?branch=master)](https://travis-ci.org/typhonjs-node-esdoc/esdoc-plugin-extends-replace)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-node-esdoc/esdoc-plugin-extends-replace.svg)](https://codecov.io/github/typhonjs/esdoc-plugin-extends-replace)
[![Dependency Status](https://www.versioneye.com/user/projects/56ddb7dc4839f7003882aaec/badge.svg?style=flat)](https://www.versioneye.com/user/projects/56ddb7dc4839f7003882aaec)

A plugin for [ESDoc](https://esdoc.org) that enables end to end Javascript ES6 documentation providing support for replacing ES6 classes `extends` target which is useful for
architectures where the target is indirectly imported. An example architecture is [backbone-es6](https://github.com/typhonjs/backbone-es6) where the main access point is a composed class, `Backbone`. In this case developers import Backbone as such:

```
import Backbone from 'backbone';

export default class MyCustomView extends Backbone.View {}
```

ESDoc has no visibility into the composed Backbone instance which occurs at runtime nor is there relevant data
to link `Backbone.View` to the actual implementing class / file in the bare source code which is parsed by ESDoc. In this example case JSPM / SystemJS is used to manage the backbone-es6 dependency. To support end to end documentation it's necessary to replace `Backbone.View` with
`<ProjectRootPath>/jspm_packages/github/typhonjs/backbone-es6@master/src/View.js`.

For the latest significant changes please see the [CHANGELOG](https://github.com/typhonjs/esdoc-plugin-extends-replace/blob/master/CHANGELOG.md).

Installation steps:
- Install `esdoc` or `gulp-esdoc` in `devDependencies` in `package.json`.
- Install `esdoc-plugin-extends-replace` in `devDependencies` in `package.json`.
- Create an `.esdocrc` or `esdoc.json` configuration file adding the plugin. 
- Add `option` -> `replace` data listing the `extends` tag to replace with the partial path on the right.
- Run ESdoc then profit!

For more information view the [ESDoc tutorial](https://esdoc.org/tutorial.html) and [ESDoc Config](https://esdoc.org/config.html) documentation.

As an alternate and the preferred all inclusive installation process please see [typhonjs-npm-build-test](https://www.npmjs.com/package/typhonjs-npm-build-test) for a NPM package which contains several dependencies for building / testing ES6 NPM modules including ESDoc generation with the following plugins including [esdoc-plugin-jspm](https://www.npmjs.com/package/esdoc-plugin-jspm), [esdoc-plugin-extends-replace](https://www.npmjs.com/package/esdoc-plugin-extends-replace), [esdoc-importpath-plugin](https://www.npmjs.com/package/esdoc-importpath-plugin]) & [esdoc-es7-plugin](https://www.npmjs.com/package/esdoc-es7-plugin) support.

Additionally [typhonjs-core-gulptasks](https://www.npmjs.com/package/typhonjs-core-gulptasks) provides a NPM package which contains several pre-defined Gulp tasks for working with JSPM / SystemJS, ESLint and ESDoc generation. 


`esdoc-plugin-extends-replace` can be used independently of JSPM / SystemJS, but the sample below from
`backbone-parse-es6-todos` shows the `.esdocrc` file that uses `esdoc-plugin-extends-replace` and
[esdoc-plugin-jspm](https://www.npmjs.com/package/esdoc-plugin-jspm).

Please refer to this repo that is using this plugin to generate end to end documentation:
https://github.com/typhonjs-demos/backbone-parse-es6-todos

```
This is the .esdocrc configuration file for the above repo:
{
   "title": "backbone-parse-es6-todos",
   "source": "site",
   "destination": "docs",
   "excludes": ["^(?:(?!\\.js$).)*$"],
   "plugins":
   [
      {
         "name": "esdoc-plugin-jspm"
      },

      {
         "name": "esdoc-plugin-extends-replace",
         "option":
         {
            "replace":
            {
               "backbone~[B|b]ackbone\\.Collection": "backbone-parse-es6@[\\s\\S]+\/src\/ParseCollection",
               "backbone~[B|b]ackbone\\.Events": "typhonjs-core-backbone-events@[\\s\\S]+\/src\/Events",
               "backbone~[B|b]ackbone\\.History": "backbone-es6@[\\s\\S]+\/src\/History",
               "backbone~[B|b]ackbone\\.Model": "backbone-parse-es6@[\\s\\S]+\/src\/ParseModel",
               "backbone~[B|b]ackbone\\.Router": "backbone-es6@[\\s\\S]+\/src\/Router",
               "backbone~[B|b]ackbone\\.View": "backbone-es6@[\\s\\S]+\/src\/View"
            }
         }
      }
   ],
   "manual":
   {
      "overview": ["./manual/overview.md"],
      "installation": ["./manual/installation.md"],
      "tutorial": ["./manual/tutorial.md"],
      "faq": ["./manual/faq.md"],
      "changelog": ["./CHANGELOG.md"]
   }
}
```

In the `option.replace` object hash the left hand is a text string or regex to search for in `extends` tags available for modification in `onHandleTag`. This string is turned into a RegExp instance and its test method used for substitution matching. On the right hand side the string is turned into a RegExp instance to capture a partial path & name of the class to replace matched extend targets. Using a RegExp versus a bare string is recommend in order to capture variation particularly in the semver / version of the JSPM package / path being linked. In `onHandleTag` all tags are first processed storing the `longname` tag for the class path in question. Then a second pass is made replacing any classes `extends` tags that match the left hand side with the `longname` of the class found on the right hand side.

Another option is `silent` which if true silences any logging output from the plugin.

Of course it should be noted that using bare strings instead of regex expressions could result in potential clashes.
It's recommended to use a regex defining a partial path including the JSPM package name as shown above. Please take
note of the semver / version number or `@master` for a dependency pulling directly from the master branch of
a repository. The regex example above takes into account any semver for the JSPM packages. It also allows some
flexibility in the code matching allowing `Backbone.<class>` or `backbone.<class>` matching in the extends
statements. It also requires the import statement for Backbone to match `import Backbone from 'backbone';` or `import backbone from 'backbone';`

If installing and working directly with `esdoc-plugin-extends-replace` the following is an example integration for `package.json` along with an NPM script to run ESDoc:
```
{
  ...

  "devDependencies": {
    "esdoc": "^0.4.0",
    "esdoc-plugin-extends-replace": "^0.4.0",
    "esdoc-plugin-jspm": "^0.6.0",
    "jspm": "^0.16.0"
  },
  
  "jspm": {
    "main": "src/ModuleRuntime.js",
    "dependencies": {
      "backbone-es6": "github:typhonjs/backbone-es6@master"
    },
     "devDependencies": {
      ....
    }
  },
  
  "scripts": {
    "esdoc": "esdoc -c .esdocrc"
  }
}
```

For the example above the local source root is `src` and the ESDoc documentation is output to `docs`. The  `backbone-es6` JSPM package is automatically linked by `esdoc-plugin-jspm`.

You may use any version of ESDoc including `gulp-esdoc`, but the example above provides an NPM script entry to launch esdoc via: `npm run esdoc`. 

To suggest a feature or report a bug: https://github.com/typhonjs/esdoc-plugin-extends-replace/issues

Many thanks to the ESDoc community for creating a valuable documentation tool. 

esdoc-plugin-extends-replace (c) 2015-present Michael Leahy, TyphonRT Inc.

esdoc-plugin-extends-replace may be freely distributed under the MPLv2.0 license.
