var util = require('./util');
var ReportComponent = require('./report_component').ReportComponent;

var SimpleReportComponent = (function(_super) {
  util.__extends(SimpleReportComponent, _super);

  function SimpleReportComponent() {
    return SimpleReportComponent.__super__.constructor.apply(this, arguments);
  }

  SimpleReportComponent.prototype.process = function() {};

  return SimpleReportComponent;

})(ReportComponent);

exports.SimpleReportComponent = SimpleReportComponent;
