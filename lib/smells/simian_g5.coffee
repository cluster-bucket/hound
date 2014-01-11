{exec} = require 'child_process'
{ReportDecorator} = require '../report_decorator'
YAML = require 'yamljs'
sh = require 'execSync'
path = require 'path'

class DuplicationDecorator extends ReportDecorator

  constructor: () ->
    super

    getReport = (dupe) ->
      filename = dupe.sourceFile.replace __dirname, ''
      "#{dupe.lineCount} duplicate lines in #{filename} from #{dupe.startLineNumber} to #{dupe.endLineNumber}"

    parse = (content, smellCallback) ->
     for set in content.simian.checks[0].sets
        dupes = {}

        for block in set.blocks
          dupes[block.sourceFile] =
            duplicates: []

        for own file, dupe of dupes
          for block in set.blocks
            # dupe.duplicates.push
            smellCallback file,
              lineCount: set.lineCount
              sourceFile: block.sourceFile
              startLineNumber: block.startLineNumber
              endLineNumber: block.endLineNumber


    @process = (sourceTree) ->
      testPath = sourceTree.getPath()
      cmd = "java -jar java_modules/simian-2.3.35/bin/simian-2.3.35.jar -formatter=yaml -threshold=3 -language=javascript \"#{testPath}/**/*.js\""
      result = sh.exec cmd
      root = path.resolve(__dirname, '../../') + '/'

      [header, yaml] = result.stdout.split '---'
      data = YAML.parse yaml
      parse data, (filename, duplicates) ->
        filename = filename.replace root, ''
        report = getReport duplicates
        sourceTree.addReport filename, report
      @component.process sourceTree

exports.DuplicationDecorator = DuplicationDecorator
