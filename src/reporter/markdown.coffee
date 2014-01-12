"use strict"

MOD_LOC_THRESHOLD = 500
MOD_MAINT_THRESHOLD = 65
MOD_DUPE_THRESHOLD = 0

FUNC_LOC_THRESHOLD = 20
FUNC_PARAMS_THRESHOLD = 3

PASS_TEXT = 'PASS'
FAIL_TEXT = 'FAIL'

format = (result) ->
  result.reports.reduce ((formatted, report) ->
    formatted + formatModule(report) + "\n\n"
  ), formatProject(result)
  
formatProject = (result) ->
  [
    "# Complexity report, ", (new Date()).toLocaleDateString(), "\n\n"
  ].join ""
  
formatModule = (report) ->

  loc = ''
  if report.aggregate.sloc.logical > MOD_LOC_THRESHOLD
    loc = "* Module size: #{FAIL_TEXT} (#{report.aggregate.sloc.logical})\n"
  
  maint = ''
  if Math.round(report.maintainability) > MOD_MAINT_THRESHOLD
    maint = "* Maintainability: #{FAIL_TEXT} (#{Math.round(report.maintainability)})\n"
  
  dupes = ''
  if report.duplicates.length > MOD_DUPE_THRESHOLD
    dupes = "* Duplicate code: #{FAIL_TEXT} (#{report.duplicates.length})\n"
  
  [
    "## ", report.path, "\n\n", 
    loc, maint, dupes,
    formatFunctions(report.functions)
  ].join ""
  
formatFunctions = (report) ->
  report.reduce ((formatted, r) ->
    funcs = formatFunction(r)
    if funcs
      return formatted + "\n" + funcs
    else
      return formatted
  ), ""
  
formatFunction = (report) ->

  loc = ''
  if report.sloc.logical > FUNC_LOC_THRESHOLD
    loc = "    * Function size: #{FAIL_TEXT} (#{report.sloc.logical})\n"
    
  params = ''
  if report.params > FUNC_PARAMS_THRESHOLD
    params = "    * Parameter count: #{FAIL_TEXT} (#{report.params})\n"
  
  if loc or params
    return [
      "* Function: **", report.name.replace("<", "&lt;"), "**\n", 
      "    * Line No.: ", report.line, "\n", 
      loc, params 
    ].join ""
  else
    return ''
    
exports.format = format