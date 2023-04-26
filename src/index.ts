#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import randomstring from 'randomstring';
import promptSync from 'prompt-sync';
import ora from 'ora';
import chalk from "chalk";

const generateRandomId = (largeId: number): string => {
  return randomstring.generate({length: largeId, charset: 'alphanumeric'});
}

const oraStart = (text = ''): any => {
  return ora({
    text,
    spinner: {
      interval: 800,
      frames: ['🚀', '🤖', '🚀', '🤖', '🚀', '🤖', '🚀', '🤖'],
    },
  }).start();
}

const addIdsToHtmlFiles = async (directory: string, largeId: number) => {
  try {
    console.log(chalk.green.bold(`🤖: Browsing Directory "${directory}"`));
    let totalFixed = 0;
    const files = fs.readdirSync(directory)
    const totalFiles = files.length;
    const reviewSpinner = oraStart(chalk.green(`Total Files: ${totalFiles}`));
    files.forEach((file, index) => {
      if (file.endsWith('.html')) {
        try {
          const filePath = path.join(process.cwd(), directory, file);
          reviewSpinner.text = chalk.green.bold(`🤖: Fixing file [${index+1} - ${totalFiles}]: ${filePath}`);

          const $ = cheerio.load(fs.readFileSync(filePath));
          $('*').each((i, element) => {
            if (!$(element).attr('id')) {
              const randomId = generateRandomId(largeId);
              $(element).attr('id', randomId);
            }
          });
          $('html').replaceWith($('html').html() || '');
          $('head').replaceWith($('head').html() || '');
          $('body').replaceWith($('body').html() || '');
          fs.writeFileSync(filePath, $.html());
          totalFixed++;
          reviewSpinner.text = chalk.green.bold(`🤖: File fixed correctly [${index+1} - ${totalFiles}]: ${filePath}`); 
        } catch (err) {
          reviewSpinner.error(
            chalk.red.bold(`🤖: Error in file "${file}"`, err)
          )
        }
      }
    });
    reviewSpinner.stop();

    console.log(chalk.green.bold(`🤖: A total of ${totalFixed} files have been fixed.`));
  } catch (err) {
    console.log(chalk.red(`🤖: Error browsing directory "${directory}"`, err));  
  }
}

const main = async () => {
  const prompt = promptSync();
  let isValid = false;
  let directory: string = '';
  let largeId: number = 8;
  while (isValid === false) {
    directory = prompt(chalk.blue.bold(`🤖: Which directory do you want to fix?: `));
    if (!directory || directory == '' || !fs.existsSync(path.join(process.cwd(), directory))) {
      console.log(chalk.red(`🤖: Enter a valid directory ...`));
    } else {
      isValid = true;
    }
  }
  isValid = false;
  while (isValid === false) {
    try {
      largeId = parseInt(prompt(chalk.blue.bold(`🤖: How long do you want the ids to be?: `)));
      if (isNaN(largeId)) {
        console.log(chalk.red(`🤖: Enter a valid large...`));
      } else {
        if (largeId == 0 || largeId > 20) {
          console.log(chalk.red(`🤖: Values ​​must be between 1 and 20...`));
        } else {
          isValid = true; 
        }
      }
    } catch (err) {
      console.log(chalk.red(`🤖: Enter a valid large ...`));
    }
  }

  addIdsToHtmlFiles(directory, largeId);
}

main();