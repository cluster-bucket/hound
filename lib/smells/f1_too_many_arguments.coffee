{ReportDecorator} = require '../report_decorator'

class TooManyArgumentsReportDecorator extends ReportDecorator

  constructor: () ->
    super

    ARGUMENT_THRESHOLD = 3

    getFunctionName = (node) ->
      if node.type is "AssignmentExpression"
        return node.left.property.name
      if node.type is "FunctionDeclaration"
        return node.id.name

    getReport = (node, problem) ->
      functionName = getFunctionName node
      lineNumber = node.loc.start.line
      "Line #{lineNumber} in function #{functionName}: #{problem}"

    parse = (syntax, callback) =>
      message = 'Too many arguments'
      @traverse syntax, (node, prevNode) ->
        if node.type is 'FunctionExpression'
          if node.params.length > ARGUMENT_THRESHOLD
            callback prevNode, message
        else if node.type is 'FunctionDeclaration'
          if node.params.length > ARGUMENT_THRESHOLD
            callback node, message

    @process = (sourceTree) ->
      files = sourceTree.getFiles()
      for own name, file of files
        parse file.syntax, (node, message) ->
          report = getReport node, message
          sourceTree.addReport name, report
      @component.process sourceTree

exports.TooManyArgumentsReportDecorator = TooManyArgumentsReportDecorator
