{ReportDecorator} = require '../report_decorator'
crypto = require 'crypto'
_ = require 'lodash'

class DuplicationDecorator extends ReportDecorator

  constructor: () ->
    super

    blocks = {}

    getReport = (dupes, problem) ->
      #console.log dupes
      #report = "#{problem}: "
      #for dupe in dupes
        #report += "at #{dupe.file} #{dupe.loc.start.line}:#{dupe.loc.start.column}-#{dupe.loc.end.line}:#{dupe.loc.end.column} "
      #report
      
    parse = (file, callback) =>
      # blocks = {}
      @traverse file.syntax, (node, prevNode) ->
        if node.type is 'BlockStatement'
          pushBlock node, file.path
      # reportDuplicates callback

    reportDuplicates = (file) =>
      report = []
      for key, dupes of blocks
        continue unless dupes.length > 1
        for dupe in dupes
          if dupe.file is file
            report.push dupes
            break
      report
      # callback dupes, 'Duplicate lines'

    pushBlock = (node, filename) ->
      clone = clean _.cloneDeep node
      key = createHash clone
      blocks[key] = [] unless blocks[key]
      blocks[key].push
        loc: node.loc
        file: filename

    clean = (syntax) =>
      @traverse syntax, (node, prevNode) ->
        delete node.loc
        delete node.value
        delete node.raw
      syntax

    createHash  = (object) ->
      str = JSON.stringify object
      md5 = crypto.createHash 'md5'
      md5.update str
      key = md5.digest 'hex'
      key

    @process = (sourceTree) ->
      files = sourceTree.getFiles()
      # Parse and store blocks for all files
      for own name, file of files
        parse file, (node, message) ->
      # Report all duplicates by file
      for own name, file of files
        duplicates = reportDuplicates name
        sourceTree.updateReport name, 'duplicates', duplicates
      @component.process sourceTree

exports.DuplicationDecorator = DuplicationDecorator
