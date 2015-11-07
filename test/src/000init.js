/**
 * 000Init -- Bootstraps the testing process by generating the documentation linking the backbone JSPM package
 * with a simple local files: TestCollection, TestEvents, TestHistory, TestRouter, & TestView. Any previous coverage
 * (./coverage) and docs (./test/fixture/docs) are deleted before docs are generated.
 *
 * @type {fse|exports|module.exports}
 */
var fs         = require('fs-extra');
var path       = require('path');
var ESDoc      = require('../../node_modules/esdoc/out/src/ESDoc.js');
var publisher  = require('../../node_modules/esdoc/out/src/Publisher/publish.js');

// Find the root path where JSPM config.js is located.
var rootPath = __dirname.split(path.sep);
rootPath.pop();
rootPath.pop();
rootPath = rootPath.join(path.sep);

var config = {
   source: './test/fixture',
   destination: './test/fixture/docs',
   jspmRootPath: rootPath,
   "plugins":
   [
      {
         "name": "esdoc-plugin-jspm"
      },

      {
         "name": "./src/plugin.js",
         "option":
         {
            "replace":
            {
               "Backbone.Collection": "backbone-es6@master/src/Collection.js",
               "Backbone.Events": "backbone-es6@master/src/Events.js",
               "Backbone.History": "backbone-es6@master/src/History.js",
               "Backbone.Model": "backbone-es6@master/src/Model.js",
               "Backbone.Router": "backbone-es6@master/src/Router.js",
               "Backbone.View": "backbone-es6@master/src/View.js"
            }
         }
      }
   ]
};

if (fs.existsSync(config.destination))
{
   fs.removeSync(config.destination);
}

if (fs.existsSync('./coverage'))
{
   fs.removeSync('./coverage');
}

ESDoc.generate(config, publisher);