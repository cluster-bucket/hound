var ReportDecorator = require('../report_decorator').ReportDecorator;
var util = require('../util');

var crypto = require('crypto');
var _ = require('lodash');

var DuplicationDecorator = (function(_super) {
  util.__extends(DuplicationDecorator, _super);

  function DuplicationDecorator() {
    DuplicationDecorator.__super__.constructor.apply(this, arguments);
    this.blocks = {};
  }

  DuplicationDecorator.prototype.process = function(sourceTree) {
    var duplicates, file, files, name;

    files = sourceTree.getFiles();
    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      file = files[name];
      this.parse(file);
    }

    for (name in files) {
      if (files.hasOwnProperty(name)) continue;
      file = files[name];
      duplicates = this.reportDuplicates(name);
      console.log(duplicates);
      sourceTree.updateReport(name, 'duplicates', duplicates);
    }
    return this.component.process(sourceTree);
  };

  DuplicationDecorator.prototype.parse = function(file) {
    var self = this;
    var callback = function (node, prevNode) {
      if (node.type === 'BlockStatement' && node.body.length > 0) {
        return self.pushBlock.call(self, node, file.path);
      }
    };
    return this.traverse(file.syntax, callback);
  };

  DuplicationDecorator.prototype.pushBlock = function(node, filename) {
    var clone, key;
    clone = this.clean(_.cloneDeep(node));
    key = this.createHash(clone);
    if (!this.blocks[key]) {
      this.blocks[key] = [];
    }
    this.blocks[key].push({
      loc: node.loc,
      file: filename
    });
  };

  DuplicationDecorator.prototype.clean = function(syntax) {
    var callback = function (node, prevNode) {
      delete node.loc;
      delete node.value;
      delete node.raw;
    };
    this.traverse(syntax, callback);
    return syntax;
  };

  DuplicationDecorator.prototype.reportDuplicates = function(file) {
    var dupe, dupes, key, report, _i, _len;
    report = [];
    for (key in this.blocks) {
      dupes = this.blocks[key];
      if (!(dupes.length > 1)) {
        continue;
      }

      for (_i = 0, _len = dupes.length; _i < _len; _i++) {
        dupe = dupes[_i];
        if (dupe.file === file) {
          report.push(dupes);
          break;
        }
      }
    }
    return report;
  };

  DuplicationDecorator.prototype.createHash = function(object) {
    var key, md5, str;
    str = JSON.stringify(object);
    md5 = crypto.createHash('md5');
    md5.update(str);
    key = md5.digest('hex');
    return key;
  };

  DuplicationDecorator.prototype.getReport = function(dupes, problem) {};

  return DuplicationDecorator;

})(ReportDecorator);

exports.Decorator = DuplicationDecorator;
