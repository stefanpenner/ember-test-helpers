"use strict";
var Resolver = require("ember/resolver")["default"];

var resolver = Resolver.create();

resolver.namespace = {
  modulePrefix: 'appkit'
};

exports["default"] = resolver;