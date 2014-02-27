NOTICE:
=======

this spike has been taking to production readiness by @rpflorence, check it out @ https://github.com/rpflorence/ember-qunit







ember-test-helpers
==================


Goals:
------

extract https://github.com/stefanpenner/ember-app-kit/tree/master/tests/helpers from EAK, and to make it available via bower
we should optimize for testability, sharing, and iteration.

structure:
----------

```sh
/dist/* transpiled output
/lib/*
/tests/unit/
/tests/integration/
/tests/acceptance/ <-- likely an entire EAK app and full testing with a real app
```

Ideas:
------

consider using https://github.com/stefanpenner/lib-kit as a starting point. although it uses mocha as a starting point,
this might be fine as we are testing qunit helpers :P
