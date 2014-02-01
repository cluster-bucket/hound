var nsh = require('node-syntaxhighlighter');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var HtmlReporter = (function () {

  function HtmlReporter () {}

  var MOD_LOC_THRESHOLD = 500;
  var MOD_MAINT_THRESHOLD = 65;
  var MOD_DUPE_THRESHOLD = 0;
  var FUNC_LOC_THRESHOLD = 20;
  var FUNC_PARAMS_THRESHOLD = 3;

  HtmlReporter.prototype.write = function (sourceTree, reportPath) {
    var name, files, report, filePath;
    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      filePath = this.createPath(reportPath, name);
      fs.writeFile(filePath + '.html', report.html, function (err) {
        if (err) throw err;
      });
    }
  };

  HtmlReporter.prototype.createPath = function (reportPath, filePath) {
    var joinedPath = path.join(reportPath, filePath);
    var dirname = path.dirname(joinedPath);
    mkdirp.sync(dirname);
    return joinedPath;
  };

  HtmlReporter.prototype.format = function (sourceTree) {
    var name, files, language, highlighted, template, html, report, issues;
    files = sourceTree.getFiles();
    language = nsh.getLanguage('js');
    template = fs.readFileSync(__dirname + '/templates/index.html').toString();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      issues = this.parse(report);
      highlighted = nsh.highlight(files[name].content, language, issues);
      html = template.replace(/\{\{highlighted\}\}/g, highlighted);
      html = html.replace(/\{\{issues\}\}/g, JSON.stringify(issues));
      sourceTree.updateReport(name, 'html', html);
    }
  };

  HtmlReporter.prototype.parse = function (report) {
    var issues = {
      highlight: [],
      duplicates: [],
      params: [],
      loc: []
    };

    report.functions.forEach(function (element, index, array) {
      if (element.sloc.logical > FUNC_LOC_THRESHOLD) {
        issues.highlight.push(element.line);
        issues.loc.push(element.line);
      }

      if (element.params > FUNC_PARAMS_THRESHOLD) {
        issues.highlight.push(element.line);
        issues.params.push(element.line);
      }
    });

    report.duplicates.forEach(function (duplicate) {
      duplicate.forEach(function (occurance) {
        var loc;
        if (occurance.file === report.path) {
          loc = occurance.loc.start.line + ':' + occurance.loc.start.column + '-';
          loc += occurance.loc.end.line + ':' + occurance.loc.end.column;
          issues.duplicates.push(loc);
          issues.highlight.push(occurance.loc.start.line);
        }
      });
    });

    return issues;
  };

  return HtmlReporter;

})();

exports.Reporter = HtmlReporter;
