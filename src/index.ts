import pdf from 'pdf-parse';
import * as fs from 'fs';
import mammoth from 'mammoth';
import processWeekplan from './weekplanProcessor';
import processMonthplan from './monthplanProcessor';
import processYearplanDocx from './yearplanDocxProcessor';
import processYearplanPdf from './yearplanPdfProcessor';
import createIcs from './icsCreator';
import { Call } from './types';
import { getFileNameNoExtensionNoPath, getFileType } from './utils';

async function main() {
    if (process.argv.includes('-help')) {
        console.log(
            'Usage: ./parsePlan [-sf] <pdf file> for parsing a moth or week plan. year plans only in docx format.',
        );
        console.log(
            'weekplans must be named "Wochenplan" and month plans "Monatsplan" and year plans "Spielzeit" followed by the year.',
        );
        console.log('Options:');
        console.log('-sf:');
        console.log('output a single calendar file (.ics) for each event');
        return;
    }
    const singleFiles = process.argv.includes('-sf');
    const fileName: string = process.argv[process.argv.length - 1];
    // console.log(fileName);
    const fileType = getFileType(fileName);
    const dataBuffer = fs.readFileSync(fileName);
    let calls: Array<Call> = [];

    switch (fileType) {
        case 'weekplan': {
            console.log('Weekplan');
            try {
                const data = await pdf(dataBuffer);
                calls = processWeekplan(data.text);
            } catch (e) {
                console.log(e);
            }
            break;
        }
        case 'monthplan': {
            try {
                console.log('monthplan');
                const data = await pdf(dataBuffer);
                calls = processMonthplan(data.text);
            } catch (e) {
                console.log(e);
            }
            break;
        }
        case 'yearplanDocx': {
            console.log('YearplanDocx');
            try {
                const data = await mammoth.extractRawText({ path: fileName });
                calls = processYearplanDocx(data.value);
            } catch (e) {
                console.log(e);
            }
            break;
        }
        case 'yearplanPdf': {
            console.log('YearplanPdf');
            try {
                const data = await pdf(dataBuffer);
                calls = processYearplanPdf(data.text);
            } catch (e) {
                console.log(e);
            }
            break;
        }
    }
    createIcs(calls, singleFiles, getFileNameNoExtensionNoPath(fileName));
}

main();
