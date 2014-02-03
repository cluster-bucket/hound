var ReportDecorator = require('../report_decorator').ReportDecorator;
var util = require('../util');
var fs = require('fs');

var jshint = require('jshint').JSHINT;

var LintDecorator = (function(_super) {
  "use strict";

  util.__extends(LintDecorator, _super);

  function LintDecorator(sourceTree, configPath) {
    this.configPath = configPath;
    LintDecorator.__super__.constructor.apply(this, arguments);
    this.loadConfig();
  }

  LintDecorator.prototype.process = function(sourceTree) {
    var files, name, results, pushErr;

    results = [];
    files = sourceTree.getFiles();
    pushErr = function (err) {
      if (err) results.push(err);
    };

    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      results = [];
      if (!jshint(files[name].content, this.config, this.globals)) {
        jshint.errors.forEach(pushErr);
      }
      sourceTree.updateReport(name, 'lint', results);
    }

    return this.component.process(sourceTree);
  };

  LintDecorator.prototype.loadConfig = function () {
    var file;

    if (!this.configPath.length) {
      this.config = {};
      return;
    }

    file = fs.readFileSync(this.configPath, 'utf-8');
    if (file) {
      try {
        this.config = JSON.parse(this.removeComments(file));
      } catch (e) {
        console.error("Can't parse config file: " + this.configPath);
        process.exit(1);
      }
    }

    if (this.config.globals) {
      this.globals = this.config.globals;
      delete this.config.globals;
    }

  };

  // Via jshint/src/cli.js
  LintDecorator.prototype.removeComments = function (str) {
    str = str || "";
    str = str.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\//g, "");
    str = str.replace(/\/\/[^\n\r]*/g, ""); // Everything after '//'
    return str;
  };

  return LintDecorator;

})(ReportDecorator);

exports.Decorator = LintDecorator;
