{ReportDecorator} = require '../report_decorator'
crypto = require 'crypto'
_ = require 'lodash'

class DuplicationDecorator extends ReportDecorator

  constructor: () ->
    super

    blocks = {}

    getReport = (dupe) ->

    parse = (file, callback) =>
      blocks = {}
      @traverse file.syntax, (node, prevNode) ->
        if node.type is 'BlockStatement'
          pushBlock node, file.path
      console.log JSON.stringify blocks

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
      for own name, file of files
        parse file, (node, message) ->
          report = getReport node, message
          sourceTree.addReport name, report
      @component.process sourceTree

exports.DuplicationDecorator = DuplicationDecorator
