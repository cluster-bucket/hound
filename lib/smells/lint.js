var ReportDecorator = require('../report_decorator').ReportDecorator;
var util = require('../util');

var jshint = require('jshint').JSHINT;

var LintDecorator = (function(_super) {
  util.__extends(LintDecorator, _super);

  function LintDecorator() {
    LintDecorator.__super__.constructor.apply(this, arguments);
  }
  
  LintDecorator.prototype.process = function(sourceTree) {
    var file, files, name, report, results;
    files = sourceTree.getFiles();
    for (name in files) {
      results = [];
      if (!files.hasOwnProperty(name)) continue;
      file = files[name];
      if (!jshint([file.content])) {
        jshint.errors.forEach(function (err) {
          if (err) {
            results.push(err);
          }
        });
      }
      sourceTree.updateReport(name, 'lint', results);

    }
    return this.component.process(sourceTree);
  };

  
  return LintDecorator;

})(ReportDecorator);

exports.LintDecorator = LintDecorator;