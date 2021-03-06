var ReportDecorator = require('../report_decorator').ReportDecorator;
var util = require('../util');

var crypto = require('crypto');
var _ = require('lodash');

var DuplicationDecorator = (function(_super) {
  util.__extends(DuplicationDecorator, _super);

  function DuplicationDecorator() {
    var blocks, clean, createHash, getReport, parse, pushBlock, reportDuplicates,
      _this = this;
    DuplicationDecorator.__super__.constructor.apply(this, arguments);
    blocks = {};
    getReport = function(dupes, problem) {};
    parse = function(file, callback) {
      return _this.traverse(file.syntax, function(node, prevNode) {
        // Exclude "system" variables
        if (node.type === "VariableDeclarator" && node.id.name.indexOf('__') === 0) {
          delete node.init;
        }

        if (node.type === 'BlockStatement') {
          // Exclude empty blocks
          if (node.body.length === 0) return;
          // Exclude blocks that only return
          if (node.body.length === 1 && node.body[0].type === "ReturnStatement") return;
          // Exclude blocks that only continue
          if (node.body.length === 1 && node.body[0].type === "ContinueStatement") return;
          return pushBlock(node, file.path);
        }
      });
    };
    reportDuplicates = function(file) {
      var dupe, dupes, key, report, _i, _len;
      report = [];
      for (key in blocks) {
        dupes = blocks[key];
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
    pushBlock = function(node, filename) {
      var clone, key;
      clone = clean(_.cloneDeep(node));
      key = createHash(clone);
      if (!blocks[key]) {
        blocks[key] = [];
      }
      return blocks[key].push({
        loc: node.loc,
        file: filename
      });
    };
    clean = function(syntax) {
      _this.traverse(syntax, function(node, prevNode) {
        delete node.loc;
        delete node.value;
        return delete node.raw;
      });
      return syntax;
    };
    createHash = function(object) {
      var key, md5, str;
      str = JSON.stringify(object);
      md5 = crypto.createHash('md5');
      md5.update(str);
      key = md5.digest('hex');
      return key;
    };
    this.process = function(sourceTree) {
      var duplicates, file, files, name;
      files = sourceTree.getFiles();
      for (name in files) {
        if (!util.__hasProp.call(files, name)) continue;
        file = files[name];
        parse(file, function(node, message) {});
      }
      for (name in files) {
        if (!util.__hasProp.call(files, name)) continue;
        file = files[name];
        duplicates = reportDuplicates(name);
        sourceTree.updateReport(name, 'duplicates', duplicates);
      }
      return this.component.process(sourceTree);
    };
  }

  return DuplicationDecorator;

})(ReportDecorator);

exports.Decorator = DuplicationDecorator;
