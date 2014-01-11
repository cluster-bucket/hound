class ReportComponent

  process: () ->

  # Executes visitor on the object and its children (recursively).
  traverse: (object, visitor, prev) ->
    return  if visitor.call(null, object, prev) is false
    for own key of object
      child = object[key]
      if typeof child is "object" and child?
        @traverse child, visitor, object

  getParseErrorReport: (err, filename, decorator) ->
    output = """
      Error parsing #{filename}
        at parse (#{decorator})

        #{err}
    """
    output

exports.ReportComponent = ReportComponent
