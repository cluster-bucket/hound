var Reporter = require('./reporter').Reporter;
var util = require('../util');

var MarkdownComplexityReporter = (function (_super) {
  util.__extends(MarkdownComplexityReporter, _super);

  function MarkdownComplexityReporter () {}
  
  MarkdownComplexityReporter.prototype.extension = ".md";
  MarkdownComplexityReporter.prototype.name = "markdownComplexity";

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

})(Reporter);

exports.Reporter = MarkdownComplexityReporter;
