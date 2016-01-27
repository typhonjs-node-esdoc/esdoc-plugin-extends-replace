/**
 * 000Init -- Bootstraps the testing process by generating the documentation linking the backbone shim
 * with a simple local files: TestCollection, TestEvents, TestHistory, TestRouter, & TestView. Any previous coverage
 * (./coverage) and docs (./test/fixture/docs) are deleted before docs are generated.
 *
 * @type {fse|exports|module.exports}
 */
var fs         = require('fs-extra');
var path       = require('path');
var ESDoc      = require('../../node_modules/esdoc/out/src/ESDoc.js');
var publisher  = require('../../node_modules/esdoc/out/src/Publisher/publish.js');

// Note that we are cheating here and using a shim for Backbone (BackboneShim.js) to avoid depending on JSPM.
var config = {
   source: './test/fixture',
   destination: './test/fixture/docs',
   "plugins":
   [
      {
         "name": "./src/plugin.js",
         "option":
         {
            "replace":
            {
               "Backbone.Collection": "fixture/BackboneShim.js~Collection",
               "Backbone.Events": "fixture/BackboneShim.js~Events",
               "Backbone.History": "fixture/BackboneShim.js~History",
               "Backbone.Model": "fixture/BackboneShim.js~Model",
               "Backbone.Router": "fixture/BackboneShim.js~Router",
               "Backbone.View": "fixture/BackboneShim.js~View"
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