import fs from 'fs';
import path from 'path';
import readdirp from 'readdirp';
import { JSDOM } from 'jsdom';
import randomstring from 'randomstring';
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

export const addIdsToHtmlFiles = async (directory: string, largeId: number, tagsToModify:string[], excludeTags: string[]) => {
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