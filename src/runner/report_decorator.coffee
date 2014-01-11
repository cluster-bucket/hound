{ReportComponent} = require './report_component'

class ReportDecorator extends ReportComponent
  constructor: (@component) ->
  process: () ->
    @component.process()

exports.ReportDecorator = ReportDecorator
