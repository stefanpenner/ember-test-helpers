module.exports = function(grunt) {
  grunt.registerMultiTask('browser', 'Export the object in <%= pkg.name %> to the window', function() {
    this.files.forEach(function(f) {
      var output = ['(function(globals, EmberTestHelpers) {'];

      output.push.apply(output, f.src.map(grunt.file.read));

      output.push('define("ember-test-helpers", [], function() { return EmberTestHelpers;});');

      output.push("window.<%= pkg.namespace %> = requireModule('<%= pkg.name %>');");

      output.push('}(window, window.EmberTestHelpers));');

      grunt.file.write(f.dest, grunt.template.process(output.join('\n')));
    });
  });
};
