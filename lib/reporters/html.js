var Reporter = require('./reporter').Reporter;
var util = require('../util');
var fs = require('fs');
var nsh = require('node-syntaxhighlighter');

var HtmlReporter = (function (_super) {
  util.__extends(HtmlReporter, _super);

  function HtmlReporter () {}
  
  HtmlReporter.prototype.extension = ".html";
  HtmlReporter.prototype.name = "html";

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
    var self = this;
    var issues = {
      highlight: [],
      duplicates: [],
      params: [],
      loc: []
    };

    report.functions.forEach(function (element, index, array) {
      if (element.sloc.logical > self.options.FUNC_LOC_THRESHOLD) {
        issues.highlight.push(element.line);
        issues.loc.push(element.line);
      }

      if (element.params > self.options.FUNC_PARAMS_THRESHOLD) {
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

})(Reporter);

exports.Reporter = HtmlReporter;
