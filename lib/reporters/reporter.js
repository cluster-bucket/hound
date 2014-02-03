var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var Reporter = (function () {

  function Reporter () {}

  Reporter.prototype.options = {
    MOD_LOC_THRESHOLD: 500,
    MOD_MAINT_THRESHOLD: 65,
    MOD_DUPE_THRESHOLD: 0,
    FUNC_LOC_THRESHOLD: 20,
    FUNC_PARAMS_THRESHOLD: 3
  };

  Reporter.prototype.write = function (sourceTree, reportPath) {
    var name, files, report, filePath;
    files = sourceTree.getFiles();
    basePath = path.resolve(process.cwd(), sourceTree.getPath());
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      filePath = this.createPath(reportPath, name, basePath);
      fs.writeFile(filePath + this.extension, report[this.name]);
    }
  };

  Reporter.prototype.createPath = function (reportPath, filePath, basePath) {
    var absFilePath = path.resolve(process.cwd(), filePath);
    var outFilePath = absFilePath.replace(basePath, '');
    var joinedPath = reportPath + outFilePath;
    var dirname = path.dirname(joinedPath);
    mkdirp.sync(dirname);
    return joinedPath;
  };

  Reporter.prototype.format = function (sourceTree) {
    var name, files, report, data;
    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      report = sourceTree.getReport(name);
      data = this.parse(report);
      sourceTree.updateReport(name, this.name, data);
    }
  };

  return Reporter;

})();

exports.Reporter = Reporter;
