import chalk from 'chalk';

export const printTitle = () => {
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