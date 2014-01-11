program = require 'commander'

{SourceTree} = require './source_tree'
{SimpleReportComponent} = require './simple_report_component'

program
  .version("0.1.0")
  .option('-t, --test <name>', 'run a specific test')
  .option('-p, --path <path>', 'use the specified path')
  .option('-e, --exclude <path>', 'exclude a specific path')
  .parse(process.argv)

logTestGroup = (testGroup) ->
  console.log "Testing #{testGroup} on #{program.path}"

unless program.path
  console.log '-p, --path is required'
  return

unless program.test
  console.log '-t, --test is required'
  return

sourceTree = new SourceTree program.path

if program.test is 'functions'
  logTestGroup program.test

  {TooManyArgumentsReportDecorator} = require './smells/f1_too_many_arguments'
  {FlagArgumentsReportDecorator} = require './smells/f3_flag_arguments'
  {DuplicationDecorator} = require './smells/g5_duplication'

  report = new SimpleReportComponent()
  report = new TooManyArgumentsReportDecorator report
  report = new FlagArgumentsReportDecorator report
  report = new DuplicationDecorator report
  report.process sourceTree

  console.log sourceTree.getReports()
