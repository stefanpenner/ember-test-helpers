define("ember-test-helpers/isolated-container", 
  ["./resolver","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var resolver = __dependency1__["default"];

    function isolatedContainer(fullNames) {
      var container = new Ember.Container();

      container.optionsForType('component', { singleton: false });
      container.optionsForType('view', { singleton: false });
      container.optionsForType('template', { instantiate: false });
      container.optionsForType('helper', { instantiate: false });

      for (var i = fullNames.length; i > 0; i--) {
        var fullName = fullNames[i - 1];
        container.register(fullName, resolver.resolve(fullName));
      }

      return container;
    }

    __exports__["default"] = isolatedContainer;
  });
define("ember-test-helpers/module-for", 
  ["./resolver","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var __testing_context__;

    var resolver = __dependency1__["default"];

    function defaultSubject(factory, options) {
      return factory.create(options);
    }

    function moduleFor(fullName, description, callbacks, delegate) {
      callbacks = callbacks || { };

      var needs = [fullName].concat(callbacks.needs || []);
      var container = isolatedContainer(needs);

      callbacks.subject = callbacks.subject || defaultSubject;

      callbacks.setup    = callbacks.setup    || function() { };
      callbacks.teardown = callbacks.teardown || function() { };

      function factory() {
        return container.lookupFactory(fullName);
      }

      function subject(options) {
        return callbacks.subject(factory(), options);
      }

      __testing_context__ = {
        container: container,
        subject: subject,
        factory: factory,
        __setup_properties__: callbacks
      };

      if (delegate) {
        delegate(container, __testing_context__);
      }

      var context = __testing_context__;
      var _callbacks = {
        setup: function(){
          buildContextVariables(context);
          callbacks.setup.call(context, container);
        },
        teardown: function(){
          Ember.run(function(){
            container.destroy();
            // destroy all cached variables
          });

          Ember.$('#ember-testing').empty();
          // maybe destroy all the add-hoc objects

          callbacks.teardown(container);
        }
      };

      module(description || fullName, _callbacks);
    }

    __exports__.moduleFor = moduleFor;// allow arbitrary named factories, like rspec let
    function buildContextVariables(context) {
      var cache = { };
      var callbacks = context.__setup_properties__;
      var factory = context.factory;
      var container = context.container;

      Ember.keys(callbacks).filter(function(key){
        // ignore the default setup/teardown keys
        return key !== 'setup' && key !== 'teardown';
      }).forEach(function(key){
        context[key] = function(options) {
          if (cache[key]) {
            return cache[key];
          }

          var result = callbacks[key](factory(), options, container);
          cache[key] = result;
          return result;
        };
      });
    }

    function test(testName, callback) {
      var context = __testing_context__; // save refence

      function wrapper() {
        var result = callback.call(context);

        function failTestOnPromiseRejection(reason) {
          ok(false, reason);
        }

        Ember.run(function(){
          stop();
          Ember.RSVP.Promise.cast(result)['catch'](failTestOnPromiseRejection)['finally'](start);
        });
      }

      QUnit.test(testName, wrapper);
    }

    __exports__.test = test;function moduleForModel(name, description, callbacks) {
      moduleFor('model:' + name, description, callbacks, function(container, context) {
        // custom model specific awesomeness
        container.register('store:main', DS.Store);
        container.register('adapter:application', DS.FixtureAdapter);

        context.__setup_properties__.store = function(){
          return container.lookup('store:main');
        };

        if (context.__setup_properties__.subject === defaultSubject) {
          context.__setup_properties__.subject = function(factory, options) {
            return Ember.run(function() {
              return container.lookup('store:main').createRecord(name, options);
            });
          };
        }
      });
    }

    __exports__.moduleForModel = moduleForModel;function moduleForComponent(name, description, callbacks) {
      moduleFor('component:' + name, description, callbacks, function(container, context) {
        var templateName = 'template:components/' + name;

        var template = resolver.resolve(templateName);

        if (template) {
          container.register(templateName, template);
          container.injection('component:' + name, 'template', templateName);
        }

        context.__setup_properties__.$ = function(selector) {
          var view = Ember.run(function(){
            return context.subject().appendTo(Ember.$('#ember-testing')[0]);
          });

          return view.$();
        };
      });
    }

    __exports__.moduleForComponent = moduleForComponent;
  });
define("ember-test-helpers/resolver", 
  ["resolver","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Resolver = __dependency1__["default"];

    var resolver = Resolver.create();

    resolver.namespace = {
      modulePrefix: 'appkit'
    };

    __exports__["default"] = resolver;
  });
define("ember-test-helpers/start-app", 
  ["appkit/app","appkit/router","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Application = __dependency1__["default"];
    var Router = __dependency2__["default"];

    function startApp(attrs) {
      var App;

      var attributes = Ember.merge({
        // useful Test defaults
        rootElement: '#ember-testing',
        LOG_ACTIVE_GENERATION:false,
        LOG_VIEW_LOOKUPS: false
      }, attrs); // but you can override;

      //TODO: pull router off of app
      //App.__container__.lookupFactory(....

      Router.reopen({
        location: 'none'
      });

      Ember.run(function(){
        App = Application.create(attributes);
        App.setupForTesting();
        App.injectTestHelpers();
      });

      App.reset(); // this shouldn't be needed, i want to be able to "start an app at a specific URL"

      return App;
    }

    __exports__["default"] = startApp;
  });
define("ember-test-helpers", 
  ["./ember-test-helpers/isolated-container","./ember-test-helpers/module-for","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var isolatedContainer = __dependency1__["default"];
    var moduleFor = __dependency2__["default"];

     __exports__["default"] = {
       isolatedContainer: isolatedContainer,
       moduleFor: moduleFor
     };
  });