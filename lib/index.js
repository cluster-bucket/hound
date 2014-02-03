'use strict';

var commander = require('commander');
var path = require('path');

var SourceTree = require('./source_tree').SourceTree;
var SimpleReportComponent = require('./simple_report_component').SimpleReportComponent;

var Hound = (function () {

  function Hound () {
    commander.version("0.1.0");
    commander.usage('[options] <path>');
    commander.option('-r, --reporter <type>', 'report type to generate', 'markdown_complexity');
    commander.option('-o, --output <path>', 'output directory for report', './');
    commander.option('-d, --duplication', 'test for duplication');
    commander.option('-c, --complexity', 'test for complexity');
    commander.option('-l, --lint [config]', 'test for lint');
    // commander.option('-s, --style [config]', 'test for style');

    commander.on('--help', function(){
      console.log('  Examples:');
      console.log('');
      console.log('    $ hound --type markdown --report ./examples ./');
      console.log('    $ hound --report ../reports ../src');
      console.log('');
    });
    commander.parse(process.argv);
  }

  Hound.prototype.decorators = ['lint', 'duplication', 'complexity'];
  Hound.prototype.selectedDecorators = [];

  Hound.prototype.run = function () {
    this.setDecorators();
    this.initSourceTree();
    this.processSourceTree();
    this.generateFormattedReport();
  };

  Hound.prototype.initSourceTree = function () {
    var tempPath = commander.args[0] || './';
    var sourcePath = path.relative(process.cwd(), tempPath);
    this.sourceTree = new SourceTree(sourcePath);
  };

  Hound.prototype.processSourceTree = function (path) {
    var tree, requireDecorator;

    tree = new SimpleReportComponent();
    requireDecorator = function (decorator) {
      var Decorator = require(decorator.path).Decorator;
      if (Decorator) {
        tree = new Decorator(tree, decorator.args);
      }
    };

    this.selectedDecorators.forEach(requireDecorator);
    tree.process(this.sourceTree);
  };

  Hound.prototype.setDecorators = function () {
    this.decorators.forEach(this.addDecorator, this);
  };

  Hound.prototype.addDecorator = function (decorator) {
    if (this.hasDecorator(decorator)) {
      this.selectedDecorators.push({
        path: './smells/' + decorator,
        args: commander[decorator]
      });
    }
  };

  Hound.prototype.hasDecorator = function (decorator) {
    return commander.hasOwnProperty(decorator);
  };

  Hound.prototype.generateFormattedReport = function () {
    var tempPath = commander.output;
    var reportPath = path.resolve(process.cwd(), tempPath);
    var reportType = commander.reporter;
    var mod, reporter;

    mod = require('./reporters/' + reportType);
    if (mod && mod.Reporter) {
      reporter = new mod.Reporter();
      reporter.format(this.sourceTree);
      reporter.write(this.sourceTree, reportPath);
    }
  };

  return Hound;
})();

module.exports = new Hound();
