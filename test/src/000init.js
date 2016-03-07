/**
 * 000Init -- Bootstraps the testing process by generating the documentation linking the backbone shim
 * with a simple local files: TestCollection, TestEvents, TestHistory, TestRouter, & TestView. Any previous coverage
 * (./coverage) and docs (./test/fixture/docs) are deleted before docs are generated.
 */
import fs         from 'fs-extra';
import ESDoc      from '../../node_modules/esdoc/out/src/ESDoc.js';
import publisher  from '../../node_modules/esdoc/out/src/Publisher/publish.js';

// Note that we are cheating here and using a shim for Backbone (BackboneShim.js) to avoid depending on JSPM.
const config =
{
   source: './test/fixture',
   destination: './test/fixture/docs',
   plugins:
   [
      {
         name: './src/plugin.js',
         option:
         {
            replace:
            {
               'Backbone.Collection': 'fixture/BackboneShim.js~Collection',
               'Backbone.Events': 'fixture/BackboneShim.js~Events',
               'Backbone.History': 'fixture/BackboneShim.js~History',
               'Backbone.Model': 'fixture/BackboneShim.js~Model',
               'Backbone.Router': 'fixture/BackboneShim.js~Router',
               'Backbone.View': 'fixture/BackboneShim.js~View'
            }
         }
      }
   ]
};

fs.emptyDirSync(config.destination);

ESDoc.generate(config, publisher);