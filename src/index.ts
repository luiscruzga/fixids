#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import promptSync from 'prompt-sync';
import chalk from "chalk";
import { config } from 'dotenv';
import readdirp from 'readdirp';
import { JSDOM } from 'jsdom';
import randomstring from 'randomstring';
import ora from 'ora';

const printTitle = () => {
  console.log(
    chalk.green.bold(`
    ███████╗██╗██╗  ██╗     ██╗██████╗ ███████╗
    ██╔════╝██║╚██╗██╔╝     ██║██╔══██╗██╔════╝
    █████╗  ██║ ╚███╔╝█████╗██║██║  ██║███████╗
    ██╔══╝  ██║ ██╔██╗╚════╝██║██║  ██║╚════██║
    ██║     ██║██╔╝ ██╗     ██║██████╔╝███████║
    ╚═╝     ╚═╝╚═╝  ╚═╝     ╚═╝╚═════╝ ╚══════╝
                                                   
`)
  );
}

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

const addIdsToHtmlFiles = async (directory: string, largeId: number, tagsToModify:string[], excludeTags: string[]) => {
  let reviewSpinner;
  try {
    console.log(chalk.green.bold(`🤖: Browsing Directory "${directory}"`));
    let totalFixed = 0;
    const files = await readdirp.promise(path.join(process.cwd(), directory), {
      fileFilter: '*.html',
      directoryFilter: (di: any) => !di.basename.startsWith('.'),
    });
    const totalFiles = files.length;
    reviewSpinner = oraStart(chalk.green(`Total Files: ${totalFiles}`));
    files.forEach((file, index) => {
      try {
        const filePath = file.fullPath;
        reviewSpinner.text = chalk.green.bold(`🤖: Fixing file [${index+1} - ${totalFiles}]: ${filePath}`);

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(fileContent, { includeNodeLocations: true });        
        
        const elements = dom.window.document.querySelectorAll('*:not(html):not(head):not(body):not(script):not(style)');
        let elementsFixed = 0;

        elements.forEach((element) => {
          if (tagsToModify.length === 0 || tagsToModify.includes(element.tagName!.toLowerCase())) {
            if (
              !element.hasAttribute('id')
              && !excludeTags.includes(element.tagName.toLowerCase())
              && element.parentElement?.tagName.toLowerCase() !== 'head'
            ) {
              element.setAttribute('id', generateRandomId(largeId));
              elementsFixed++;
            }
          }
        });

        if (elementsFixed > 0) {
          let fixedContent = dom.serialize({ pretty: true });
          if (!fileContent.includes('<html')) fixedContent = fixedContent.replace(/<\/?html>/gi, '');
          if (!fileContent.includes('<head')) fixedContent = fixedContent.replace(/<\/?head>/gi, '');
          if (!fileContent.includes('<body')) fixedContent = fixedContent.replace(/<\/?body>/gi, '');
          fs.writeFileSync(filePath, fixedContent);
          totalFixed++;
        }
        reviewSpinner.text = chalk.green.bold(`🤖: File fixed correctly [${index+1} - ${totalFiles}]: ${filePath}`); 
      } catch (err) {
        reviewSpinner.fail(
          chalk.red.bold(`🤖: Error in file "${file.fullPath}"`, err)
        )
      }
    });
    reviewSpinner.stop();

    console.log(chalk.green.bold(`🤖: A total of ${totalFixed} files have been fixed.`));
  } catch (err) {
    console.log(chalk.red(`🤖: Error browsing directory "${directory}"`, err));
    if (reviewSpinner) reviewSpinner.stop();
  }
}

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