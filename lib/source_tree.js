var fs = require('fs');
var esprima = require('esprima');

var SourceTree = (function() {

  var FILE_EXTENSION = '.js';

  function SourceTree(path) {
    var self = this;
    this.files = {};
    this.reports = {};
    this.path = path;
    this.walkFiles(this.path, function () {
      self.readFiles.apply(self, arguments);
    });
  }

  SourceTree.prototype.walkFiles = function(dir, done) {
    var self = this;
    var i, list, next, results;

    results = [];
    list = fs.readdirSync(dir);
    i = 0;

    next = function() {
      var file, stat;
      file = list[i++];
      if (!file) {
        return done(null, results, dir);
      }
      file = dir + "/" + file;
      stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        return self.walkFiles(file, function(err, res) {
          results = results.concat(res);
          return next();
        });
      } else {
        results.push(file);
        return next();
      }
    };

    return next();
  };

  SourceTree.prototype.readFiles = function(err, results, dirname) {
    if (err) {
      throw new Error(err);
    }

    var self = this;

    return results.forEach(function(filename) {
      var content, e, syntax;
      if (filename.substr(-3) !== FILE_EXTENSION) return;

      if (!self.files[filename]) {
        self.files[filename] = {};
      }
      content = fs.readFileSync(filename, 'utf-8');
      self.files[filename].content = content;
      self.files[filename].path = filename;
      try {
        syntax = esprima.parse(content, {
          tolerant: true,
          loc: true
        });
        return self.files[filename].syntax = syntax;
      } catch (_error) {
        e = _error;
        return self.files[filename].syntax = e;
      }
    });
  };


  SourceTree.prototype.getPath = function() {
    return this.path;
  };

  SourceTree.prototype.getFiles = function() {
    return this.files;
  };

  SourceTree.prototype.addReport = function(filename, report) {
    this.reports[filename] = report || {};
    return this.reports[filename].path = filename;
  };

  SourceTree.prototype.updateReport = function(filename, key, val) {
    if (!this.reports[filename]) return;
    return this.reports[filename][key] = val;
  };

  SourceTree.prototype.getReport = function(filename) {
    return this.reports[filename];
  };

  SourceTree.prototype.getFormatterReports = function() {
    var formatterReports, name, report;
    formatterReports = {
      reports: []
    };
    for (name in this.reports) {
      report = this.reports[name];
      formatterReports.reports.push(report);
    }
    return formatterReports;
  };

  SourceTree.prototype.getReports = function() {
    return this.reports;
  };

  return SourceTree;

})();

exports.SourceTree = SourceTree;

