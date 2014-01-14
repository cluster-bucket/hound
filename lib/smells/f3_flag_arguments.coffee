{ReportDecorator} = require '../report_decorator'

class FlagArgumentsReportDecorator extends ReportDecorator

  constructor: () ->
    super

    getFunctionName = (node) ->
      return node.callee.name  if node.callee.type is "Identifier"
      node.callee.property.name  if node.callee.type is "MemberExpression"

    getReport = (node, problem) ->
      functionName = getFunctionName(node)
      lineNumber = node.loc.start.line
      "  Line #{lineNumber} in function #{functionName}: #{problem}"

    doubleNegativeList = ["hidden", "caseinsensitive", "disabled"]

    checkSingleArgument = (node, callback) ->
      args = node["arguments"]
      functionName = getFunctionName(node)
      return if (args.length isnt 1) or (typeof args[0].value isnt "boolean")

      # Check if the method is a setter, i.e. starts with 'set',
      # e.g. 'setEnabled(false)'.
      if functionName.substr(0, 3) isnt "set"
        callback node, "Boolean literal with a non-setter function"
      # Does it contain a term with double-negative meaning?
      doubleNegativeList.forEach (term) ->
        if functionName.toLowerCase().indexOf(term.toLowerCase()) >= 0
          callback node, "Boolean literal with confusing double-negative"

    checkMultipleArguments = (node, callback) ->
      args = node["arguments"]
      literalCount = 0
      args.forEach (arg) ->
        literalCount++  if typeof arg.value is "boolean"

      # At least two arguments must be Boolean literals.
      if literalCount >= 2

        # Check for two different Boolean literals in one call.
        if literalCount is 2 and args.length is 2
          if args[0].value isnt args[1].value
            callback node, "Confusing true vs false"
            return
        callback node, "Multiple Boolean literals"

    checkLastArgument = (node, callback) ->
      args = node["arguments"]
      return if args.length < 2
      if typeof args[args.length - 1].value is "boolean"
        callback node, "Ambiguous Boolean literal as the last argument"

    parse = (syntax, callback) =>
      @traverse syntax, (node) ->
        if node.type is "CallExpression"
          checkSingleArgument node, callback
          checkLastArgument node, callback
          checkMultipleArguments node, callback

    @process = (sourceTree) ->
      files = sourceTree.getFiles()
      for own name, file of files
        parse file.syntax, (node, message) ->
          report = getReport node, message
          sourceTree.addReport name, report
      @component.process sourceTree

exports.FlagArgumentsReportDecorator = FlagArgumentsReportDecorator
