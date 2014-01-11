fs = require 'fs'
esprima = require 'esprima'

class SourceTree
  constructor: (path) ->

    FILE_EXTENSION = '.js'
    files = {}
    reports = {}

    # http://stackoverflow.com/q/5827612/
    walkFiles = (dir, done) ->
      results = []
      list = fs.readdirSync dir
      i = 0
      next = ->
        file = list[i++]
        return done(null, results, dir)  unless file
        file = dir + "/" + file
        stat = fs.statSync file
        if stat and stat.isDirectory()
          walkFiles file, (err, res) ->
            results = results.concat(res)
            do next
        else
          results.push file
          do next
      do next

    readFiles = (err, results, dirname) ->
      throw new Error(err) if err
      results.forEach (filename) ->
        return unless filename.substr(-3) is FILE_EXTENSION
        files[filename] = {} unless files[filename]

        content = fs.readFileSync filename, 'utf-8'
        files[filename].content = content
        files[filename].path = filename

        try
          syntax = esprima.parse content, {tolerant: true, loc: true}
          files[filename].syntax = syntax
        catch e
          files[filename].syntax = e

    walkFiles path, readFiles

    @getPath = () ->
      path

    @getFiles = () ->
      files

    @addReport = (filename, report) ->
      unless reports[filename]
        reports[filename] = []
      reports[filename].push report

    @getReports = () ->
      reports

exports.SourceTree = SourceTree
