#!/usr/bin/env node
import { Command } from 'commander'
import { description, version } from '../package.json'

let cli = new Command()

cli
  .description(description)
  .version(version, '-v, --version')
  .command('test')
  .description('test command')
  .action(() => {
    console.log('test command called')
  })
  .parse(process.argv)