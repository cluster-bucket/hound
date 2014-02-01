var util = require('./util');
var ReportComponent = require('./report_component').ReportComponent;

var ReportDecorator = (function(_super) {
  util.__extends(ReportDecorator, _super);

  function ReportDecorator(component) {
    this.component = component;
  }

  ReportDecorator.prototype.process = function() {
    return this.component.process();
  };

  return ReportDecorator;

})(ReportComponent);

exports.ReportDecorator = ReportDecorator;
