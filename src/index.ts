#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import promptSync from 'prompt-sync';
import chalk from "chalk";
import { config } from 'dotenv';
import { printTitle } from './utils/title';
import { addIdsToHtmlFiles } from './utils/fix';

const main = async () => {
  printTitle();
  config({ path: path.join(process.cwd(), '.env.local') });
  const prompt = promptSync();
  
  let directory = process.env.FIX_DIRECTORY || '';
  let largeId = parseInt(process.env.FIX_LARGE_ID);
  let allowedTags = process.env.FIX_ALLOWED_TAGS || '';
  let excludeTags = process.env.FIX_EXCLUDED_TAGS || 'html, head, body';

  if (!directory) {
    let isValid = false;
    while (!isValid) {
      directory = prompt(chalk.blue.bold(`🤖: Which directory do you want to fix?: `));
      if (!directory || directory === '' || !fs.existsSync(path.join(process.cwd(), directory))) {
        console.log(chalk.red(`🤖: Enter a valid directory ...`));
      } else {
        isValid = true;
      }
    }
  }

  if (!largeId) {
    let isValid = false;
    while (!isValid) {
      try {
        largeId = parseInt(prompt(chalk.blue.bold(`🤖: How long do you want the ids to be?: `)));
        if (isNaN(largeId)) {
          console.log(chalk.red(`🤖: Enter a valid large...`));
        } else if (largeId === 0 || largeId > 20) {
          console.log(chalk.red(`🤖: Values must be between 1 and 20...`));
        } else {
          isValid = true; 
        }
      } catch (err) {
        console.log(chalk.red(`🤖: Enter a valid large ...`));
      }
    }
  }

  if (!allowedTags) {
    allowedTags = prompt(chalk.blue.bold(`🤖: You want to limit the tags that need to be fixed (example: button, a, img, li)?: `)) || '';
  }

  if (!allowedTags) {
    excludeTags = prompt(chalk.blue.bold(`🤖: Do you want to exclude tags so that ids are not attached to them (example: span, i, bold)?: `)) || '';
    if (excludeTags.trim() !== '') {
      excludeTags = `html, head, body, ${excludeTags}`;
    } else {
      excludeTags = 'html, head, body';
    }
  }

  const tagsToModify = allowedTags.trim() !== '' ?  allowedTags.split(',').map(el => el.trim()) : [];
  const excludeTagsArr = excludeTags.split(',').map(el => el.trim());

  addIdsToHtmlFiles(directory, largeId, tagsToModify, excludeTagsArr);
}


main();