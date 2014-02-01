var ReportDecorator = require('../report_decorator').ReportDecorator;
var util = require('../util');

var escomplex = require('escomplex');
var walker = require('escomplex-ast-moz');

var EscomplexDecorator = (function(_super) {
  util.__extends(EscomplexDecorator, _super);

  function EscomplexDecorator() {
    EscomplexDecorator.__super__.constructor.apply(this, arguments);
  }
  
  EscomplexDecorator.prototype.process = function(sourceTree) {
    var file, files, name, report;
    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      file = files[name];
      try {
        report = escomplex.analyse(file.syntax, walker, {});
      } catch (e) {
        console.log('Error processing ' + name + ':\n' + e.message);
      }
      sourceTree.addReport(name, report);
    }
    return this.component.process(sourceTree);
  };

  return EscomplexDecorator;

})(ReportDecorator);

exports.EscomplexDecorator = EscomplexDecorator;
