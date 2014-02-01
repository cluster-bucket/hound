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
      fs.writeFile(filePath + '.md', report.markdown, function (err) {
        if (err) throw err;
      });
    }
  };

  MarkdownComplexityReporter.prototype.createPath = function (reportPath, filePath) {
    var joinedPath = path.join(reportPath, filePath);
    var dirname = path.dirname(joinedPath);
    mkdirp.sync(dirname);
    return joinedPath;
  };

  MarkdownComplexityReporter.prototype.format = function (sourceTree) {
    var name, files, report, issues, markdown;
    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      issues = this.parse(report);
      sourceTree.updateReport(name, 'markdown', issues);
    }
  };

  MarkdownComplexityReporter.prototype.parse = function (report) {
    var formatted = format({reports: [report]});
    return formatted;
  };

  function format(result) {
    return result.reports.reduce((function(formatted, report) {
      return formatted + formatModule(report) + "\n\n";
    }), '');
  }

  function formatModule(report) {
    var ret = [];
    var duplicates, functions;

    if (report.aggregate.sloc.logical > MOD_LOC_THRESHOLD) {
      ret.push("* Module is longer than " + MOD_LOC_THRESHOLD + " logical lines (" + report.aggregate.sloc.logical + ")");
    }

    if (Math.round(report.maintainability) < MOD_MAINT_THRESHOLD) {
      ret.push("* Maintainability index is less than " + MOD_MAINT_THRESHOLD + " (" + (Math.round(report.maintainability)) + ")");
    }

    functions = formatFunctions(report.functions);
    if (functions) ret.push(functions);

    duplicates = formatDuplicates(report);
    if (duplicates) ret.push(duplicates);

    return ret.join("\n");
  };

  function formatFunctions(report) {
    return report.reduce((function(formatted, r) {
      return formatted + formatFunction(r);
    }), "");
  };

  function formatFunction(report) {
    var ret = [];

    if (report.sloc.logical > FUNC_LOC_THRESHOLD) {
      ret.push("  * is longer than " + FUNC_LOC_THRESHOLD + " logical lines (" + report.sloc.logical + ")");
    }

    if (report.params > FUNC_PARAMS_THRESHOLD) {
      ret.push("  * has more than " + FUNC_PARAMS_THRESHOLD + " arguments (" + report.params + ")");
    }

    if (ret.length > 0) {
      ret.unshift("* Function **" + report.name.replace("<", "&lt;") + "** at line " + report.line);
      return ret.join("\n") + "\n";
    }

    return '';
  };

  function formatDuplicates(report) {
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
  }

  return MarkdownComplexityReporter;

})();

exports.Reporter = MarkdownComplexityReporter;
