"use strict"

format = (result) ->
  result.reports.reduce ((formatted, report) ->
    formatted + formatModule(report) + "\n\n"
  ), formatProject(result)
  
formatProject = (result) ->
  [
    "# Complexity report, ", (new Date()).toLocaleDateString(), "\n\n", 
    "* First-order density: ", result.firstOrderDensity, "%\n", 
    "* Change cost: ", result.changeCost, "%\n", 
    "* Core size: ", result.coreSize, "%\n\n"
  ].join ""
  
formatModule = (report) ->
  [
    "## ", report.path, "\n\n", 
    "* Physical LOC: ", report.aggregate.sloc.physical, "\n", 
    "* Logical LOC: ", report.aggregate.sloc.logical, "\n", 
    "* Mean parameter count: ", report.params, "\n", 
    "* Cyclomatic complexity: ", report.aggregate.cyclomatic, "\n", 
    "* Cyclomatic complexity density: ", report.aggregate.cyclomaticDensity, "%\n", 
    "* Maintainability index: ", report.maintainability, "\n", 
    "* Dependency count: ", report.dependencies.length, formatFunctions(report.functions)
  ].join ""
  
formatFunctions = (report) ->
  report.reduce ((formatted, r) ->
    formatted + "\n" + formatFunction(r)
  ), ""
  
formatFunction = (report) ->
  [
    "* Function: **", report.name.replace("<", "&lt;"), "**\n", 
    "    * Line No.: ", report.line, "\n", 
    "    * Physical LOC: ", report.sloc.physical, "\n", 
    "    * Logical LOC: ", report.sloc.logical, "\n", 
    "    * Parameter count: ", report.params, "\n", 
    "    * Cyclomatic complexity: ", report.cyclomatic, "\n", 
    "    * Cyclomatic complexity density: ", report.cyclomaticDensity, "%\n", 
    "    * Halstead difficulty: ", report.halstead.difficulty, "\n", 
    "    * Halstead volume: ", report.halstead.volume, "\n", 
    "    * Halstead effort: ", report.halstead.effort
  ].join ""
  
exports.format = format