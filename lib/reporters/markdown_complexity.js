var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var MarkdownComplexityReporter = (function () {

  function MarkdownComplexityReporter () {}

  var MOD_LOC_THRESHOLD = 500;
  var MOD_MAINT_THRESHOLD = 65;
  var MOD_DUPE_THRESHOLD = 0;
  var FUNC_LOC_THRESHOLD = 20;
  var FUNC_PARAMS_THRESHOLD = 3;

  MarkdownComplexityReporter.prototype.write = function (sourceTree, reportPath) {
    var name, files, report, filePath;
    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      filePath = this.createPath(reportPath, name);
      fs.writeFile(filePath + '.md', report.markdownComplexity, function (err) {
        if (err) throw err;
      });
    }
  };

  MarkdownComplexityReporter.prototype.createPath = function (reportPath, filePath) {
    var joinedPath = path.join(reportPath, filePath);
    var dirname = path.dirname(joinedPath);
    mkdirp.sync(dirname);
    console.log(reportPath, filePath, joinedPath);
    return joinedPath;
  };

  MarkdownComplexityReporter.prototype.format = function (sourceTree) {
    var name, files, report, issues, markdown;
    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      issues = this.parse(report);
      sourceTree.updateReport(name, 'markdownComplexity', issues);
    }
  };

  MarkdownComplexityReporter.prototype.parse = function (report) {
    return format({reports: [report]});
  };

  function format(result) {
    return result.reports.reduce((function(formatted, report) {
      return formatted + formatModule(report) + "\n\n";
    }), '');
  }

  function formatModule(report) {
    return [
      "* Physical LOC: ", report.aggregate.sloc.physical, "\n",
      "* Logical LOC: ", report.aggregate.sloc.logical, "\n",
      "* Mean parameter count: ", report.params, "\n",
      "* Cyclomatic complexity: ", report.aggregate.cyclomatic, "\n",
      "* Cyclomatic complexity density: ", report.aggregate.cyclomaticDensity, "%\n",
      "* Maintainability index: ", report.maintainability, "\n",
      "* Dependency count: ", report.dependencies.length, formatFunctions(report.functions)
    ].join("");
  };

  function formatFunctions(report) {
    return report.reduce((function(formatted, r) {
      return formatted + "\n" + formatFunction(r);
    }), "");
  };

  function formatFunction(report) {
    return [
      "* Function: **", report.name.replace("<", "&lt;"), "**\n",
      "    * Line No.: ", report.line, "\n",
      "    * Physical LOC: ", report.sloc.physical, "\n",
      "    * Logical LOC: ", report.sloc.logical, "\n",
      "    * Parameter count: ", report.params, "\n",
      "    * Cyclomatic complexity: ", report.cyclomatic, "\n",
      "    * Cyclomatic complexity density: ", report.cyclomaticDensity, "%\n",
      "    * Halstead difficulty: ", report.halstead.difficulty, "\n",
      "    * Halstead volume: ", report.halstead.volume, "\n",
      "    * Halstead effort: ", report.halstead.effort
    ].join("");
  };

  return MarkdownComplexityReporter;

})();

exports.Reporter = MarkdownComplexityReporter;
