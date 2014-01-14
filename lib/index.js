'use strict';

var commander = require('commander');
var SourceTree = require('./source_tree').SourceTree;
var SimpleReportComponent = require('./simple_report_component').SimpleReportComponent;
var EscomplexDecorator = require('./smells/escomplex').EscomplexDecorator;
var DuplicationDecorator = require('./smells/g5_duplication').DuplicationDecorator;
var HtmlReporter = require('./reporters/html').HtmlReporter;

var Hound = (function () {

  function Hound () {
    commander.version("0.1.0");
    commander.usage('[options] <path>');
    commander.option('-e, --exclude <path>', 'exclude a specific path');
    commander.option('-r, --report <path>', 'directory to write report to');
    commander.parse(process.argv);
  }

  Hound.prototype.run = function () {
    this.initSourceTree();
    this.processSourceTree();
    this.generateFormattedReport();
  };

  Hound.prototype.initSourceTree = function () {
    var path = commander.args[0] || './';
    this.sourceTree = new SourceTree(path);
  };

  Hound.prototype.processSourceTree = function (path) {
    var report;
    report = new SimpleReportComponent();
    report = new DuplicationDecorator(report);
    report = new EscomplexDecorator(report);
    report.process(this.sourceTree);
  };

  Hound.prototype.generateFormattedReport = function () {
    var htmlReporter = new HtmlReporter();
    htmlReporter.format(this.sourceTree);
    htmlReporter.write(this.sourceTree, commander.report);
  };

  return Hound;
})();

module.exports = new Hound();
