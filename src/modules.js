/**
 * Super-basic shim for AMD.
 * Probably too limited to even fairly be called an AMD shim.
 */
(function (GLOBALS) {
    "use strict";
    var toString = GLOBALS.Object.prototype.toString,
        modules = {};

    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    function define(id, dependencies, factory) {
        var argv = [],
            i;

        // Attempt to gather dependencies. If we can't, then
        // push to pending and break out.
        for (i = 0; i < dependencies.length; i += 1) {
            if (dependencies[i] === 'exports') {
                argv[i] = {};
            } else {
                argv[i] = modules[dependencies[i]];
            }
        }
        if (isFunction(factory)) {
            modules[id] = factory.apply(undefined, argv);
        } else {
            modules[id] = factory;
        }
    }

    function require(dependencies, callback) {
        var argv = [],
            i;
        if (arguments.length === 1) {
            // one-argument form
            return modules[dependencies];
        }
        for (i = 0; i < dependencies.length; i += 1) {
            argv[i] = modules[dependencies[i]];
        }
        callback.apply(undefined, argv);
    }

    GLOBALS.define = define;
    GLOBALS.require = require;
}(this));
