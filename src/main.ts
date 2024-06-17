import inquirer from 'inquirer';
import * as fs from 'fs';
import path from 'path';
import { Call, PlanTypes, PlanType } from './types';
import { getFileType, getFileNameNoExtensionNoPath } from './utils';
import processWeekplan from './weekplanProcessor';
import processMonthplan from './monthplanProcessor';
import processYearplanDocx from './yearplanDocxProcessor';
import createICS from './icsCreator';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

interface answer {
    file: string;
}

interface returnObject {
    filePath: string;
    fileType: PlanType;
}
async function selectFile(filePath: string): Promise<returnObject> {
    let fileSelected = false;
    let answers: answer = { file: '' };
    while (!fileSelected) {
        const files: string[] = fs.readdirSync(filePath);
        files.forEach((file, i) => {
            if (fs.lstatSync(path.join(filePath, file)).isDirectory()) {
                files[i] = '/' + file;
            }
        });
        files.unshift('/..');

        answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'file',
                choices: files,
                pageSize: 15,
            },
        ]);
        if (fs.lstatSync(path.join(filePath, answers.file)).isFile()) {
            fileSelected = true;
        } else {
            filePath = path.join(filePath, answers.file);
        }
    }
    filePath = path.join(filePath, answers.file);

    let fileType = getFileType(answers.file);

    if (!fileType) {
        fileType = await inquirer.prompt([
            {
                message: 'Please select the file type',
                type: 'list',
                name: 'fileType',
                choices: PlanTypes,
            },
        ]);
    }
    return { filePath, fileType };
}

async function main() {
    const filePath = __dirname;
    const selectedFilePath = await selectFile(filePath);
    // console.log(selectedFilePath);
    const buffer = fs.readFileSync(selectedFilePath.filePath);
    let calls: Call[] = [];
    switch (selectedFilePath.fileType) {
        case 'weekplan':
            {
                const data = await pdf(buffer);
                calls = processWeekplan(data.text);
            }
            break;
        case 'monthplan':
            {
                const data = await pdf(buffer);
                calls = processMonthplan(data.text);
            }
            break;
        case 'yearplanDocx':
            {
                const data = await mammoth.extractRawText({
                    buffer: buffer,
                });
                calls = processYearplanDocx(data.value);
            }
            break;
        default:
            throw new Error('Invalid file type');
    }
    createICS(
        calls,
        false,
        getFileNameNoExtensionNoPath(selectedFilePath.filePath),
    );
}
main();
