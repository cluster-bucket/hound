'use strict';

var commander = require('commander');
var path = require('path');

var SourceTree = require('./source_tree').SourceTree;
var SimpleReportComponent = require('./simple_report_component').SimpleReportComponent;
var EscomplexDecorator = require('./smells/complexity').EscomplexDecorator;
var DuplicationDecorator = require('./smells/duplication').DuplicationDecorator;
var LintDecorator = require('./smells/lint').LintDecorator;

var Hound = (function () {

  function Hound () {
    commander.version("0.1.0");
    commander.usage('[options] <path>');
    commander.option('-t, --type <type>', 'report type to generate', 'markdown_complexity');
    commander.option('-r, --report <path>', 'directory to write report to', './');
    commander.parse(process.argv);
  }

  Hound.prototype.run = function () {
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
    var report;
    report = new SimpleReportComponent();
    report = new LintDecorator(report);
    report = new DuplicationDecorator(report);
    report = new EscomplexDecorator(report);
    report.process(this.sourceTree);
  };

  Hound.prototype.generateFormattedReport = function () {
    var tempPath = commander.report;
    var reportPath = path.relative(process.cwd(), tempPath);
    var reportType = commander.type;
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
