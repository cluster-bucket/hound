var ReportDecorator = require('../report_decorator').ReportDecorator;
var util = require('../util');

var FlagArgumentsReportDecorator = (function(_super) {
  util.__extends(FlagArgumentsReportDecorator, _super);

  function FlagArgumentsReportDecorator() {} {
    FlagArgumentsReportDecorator.__super__.constructor.apply(this, arguments);
  }

  FlagArgumentsReportDecorator.prototype.doubleNegativeList = ["hidden", "caseinsensitive", "disabled"];

  FlagArgumentsReportDecorator.prototype.getFunctionName = function (node) {
    if (node.callee.type === "Identifier") {
      return node.callee.name;
    }
    if (node.callee.type === "MemberExpression") {
      return node.callee.property.name;
    }
  };

  FlagArgumentsReportDecorator.prototype.getReport = function(node, problem) {
    var functionName = this.getFunctionName(node);
    var lineNumber = node.loc.start.line;
    return "  Line " + lineNumber + " in function " + functionName + ": " + problem;
  };

  FlagArgumentsReportDecorator.prototype.checkSingleArgument = function(node, callback) {
    var args = node["arguments"];
    var functionName = this.getFunctionName(node);
    if ((args.length !== 1) || (typeof args[0].value !== "boolean")) {
      return;
    }
    if (functionName.substr(0, 3) !== "set") {
      callback(node, "Boolean literal with a non-setter function");
    }
    return this.doubleNegativeList.forEach(function(term) {
      if (functionName.toLowerCase().indexOf(term.toLowerCase()) >= 0) {
        return callback(node, "Boolean literal with confusing double-negative");
      }
    });
  };

  FlagArgumentsReportDecorator.prototype.checkMultipleArguments = function(node, callback) {
    var args, literalCount;
    args = node["arguments"];
    literalCount = 0;
    args.forEach(function(arg) {
      if (typeof arg.value === "boolean") {
        return literalCount++;
      }
    });
    if (literalCount >= 2) {
      if (literalCount === 2 && args.length === 2) {
        if (args[0].value !== args[1].value) {
          callback(node, "Confusing true vs false");
          return;
        }
      }
      return callback(node, "Multiple Boolean literals");
    }
  };

  FlagArgumentsReportDecorator.prototype.checkLastArgument = function(node, callback) {
    var args;
    args = node["arguments"];
    if (args.length < 2) {
      return;
    }
    if (typeof args[args.length - 1].value === "boolean") {
      return callback(node, "Ambiguous Boolean literal as the last argument");
    }
  };

  FlagArgumentsReportDecorator.prototype.parse = function(syntax, callback) {
    var self = this;
    return this.traverse(syntax, function(node) {
      if (node.type === "CallExpression") {
        self.checkSingleArgument(node, callback);
        self.checkLastArgument(node, callback);
        self.checkMultipleArguments(node, callback);
      }
    });
  };

  FlagArgumentsReportDecorator.prototype.process = function(sourceTree) {
    var self = this;
    var file, files, name, callback;

    files = sourceTree.getFiles();
    callback = function(node, message) {
      var report = self.getReport(node, message);
      return sourceTree.addReport(name, report);
    };

    for (name in files) {
      if (!files.hasOwnProperty(name)) continue;
      file = files[name];
      this.parse(file.syntax, callback);
    }

    return this.component.process(sourceTree);
  };

  return FlagArgumentsReportDecorator;

})(ReportDecorator);

exports.Decorator = FlagArgumentsReportDecorator;
