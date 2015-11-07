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
               "Backbone.Collection": "Collection",
               "Backbone.Events": "Events",
               "Backbone.History": "History",
               "Backbone.Model": "Model",
               "Backbone.Router": "Router",
               "Backbone.View": "View"
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