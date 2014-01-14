{ReportDecorator} = require '../report_decorator'
escomplex = require 'escomplex'
walker = require 'escomplex-ast-moz'

class EscomplexDecorator extends ReportDecorator

  constructor: () ->
    super
    
    @process = (sourceTree) ->
      files = sourceTree.getFiles()
      for own name, file of files
          report = escomplex.analyse file.syntax, walker, {}
          sourceTree.addReport name, report
      @component.process sourceTree

exports.EscomplexDecorator = EscomplexDecorator
