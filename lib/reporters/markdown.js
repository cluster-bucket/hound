var Reporter = require('./reporter').Reporter;
var util = require('../util');

var MarkdownComplexityReporter = (function (_super) {
  util.__extends(MarkdownComplexityReporter, _super);

  function MarkdownComplexityReporter () {}
  
  MarkdownComplexityReporter.prototype.extension = ".md";
  MarkdownComplexityReporter.prototype.name = "markdown";

  MarkdownComplexityReporter.prototype.parse = function (report) {
    return this.formatModule(report) + "\n\n";
  };

  MarkdownComplexityReporter.prototype.formatModule = function (report) {
    var ret = [];
    var duplicates, functions, lint;

    if (report.aggregate.sloc.logical > this.options.MOD_LOC_THRESHOLD) {
      ret.push("* Module is longer than " + this.options.MOD_LOC_THRESHOLD + " logical lines (" + report.aggregate.sloc.logical + ")");
    }

    if (Math.round(report.maintainability) < this.options.MOD_MAINT_THRESHOLD) {
      ret.push("* Maintainability index is less than " + this.options.MOD_MAINT_THRESHOLD + " (" + (Math.round(report.maintainability)) + ")");
    }

    functions = this.formatFunctions(report.functions);
    if (functions) ret.push(functions);

    duplicates = this.formatDuplicates(report);
    if (duplicates) ret.push(duplicates);
    
    lint = this.formatLint(report);
    if (lint) ret.push(lint);

    return ret.join("\n");
  };

  MarkdownComplexityReporter.prototype.formatFunctions = function (report) {
    var self = this;
    return report.reduce((function(formatted, r) {
      return formatted + self.formatFunction(r);
    }), "");
  };

  MarkdownComplexityReporter.prototype.formatFunction = function (report) {
    var ret = [];

    if (report.sloc.logical > this.options.FUNC_LOC_THRESHOLD) {
      ret.push("  * is longer than " + this.options.FUNC_LOC_THRESHOLD + " logical lines (" + report.sloc.logical + ")");
    }

    if (report.params > this.options.FUNC_PARAMS_THRESHOLD) {
      ret.push("  * has more than " + this.options.FUNC_PARAMS_THRESHOLD + " arguments (" + report.params + ")");
    }

    if (ret.length > 0) {
      ret.unshift("* Function **" + report.name.replace("<", "&lt;") + "** at line " + report.line);
      return ret.join("\n") + "\n";
    }

    return '';
  };

  MarkdownComplexityReporter.prototype.formatDuplicates = function (report) {
    var ret = [];
    report.duplicates.forEach(function (duplicate) {
      if (duplicate.length === 0) return;
      ret.push('* Duplicate code block');
      duplicate.forEach(function (occurance) {
        var loc;
        if (occurance.file === report.path) {
          loc = occurance.loc.start.line + ':' + occurance.loc.start.column + ' to ';
          loc += occurance.loc.end.line + ':' + occurance.loc.end.column;
          ret.push('  * in ' + occurance.file + ' at line ' + loc);
        }
      });
    });
    return ret.join("\n");
  };
  
  MarkdownComplexityReporter.prototype.formatLint = function (report) {
    var ret = [];
    report.lint.forEach(function (err) {
      ret.push('Lint error on line ' + err.line + ':' + err.character + '\n  ' + err.reason);
    });
    return ret.join("\n");
  };
  
  return MarkdownComplexityReporter;

})(Reporter);

exports.Reporter = MarkdownComplexityReporter;
