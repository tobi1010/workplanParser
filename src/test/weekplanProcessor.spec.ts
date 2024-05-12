import processWeekplan from '../weekplanProcessor';
import { Call } from '../types';
import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
describe('processWeekplan', () => {
    it('should return the correct array of calls', async () => {
        const fileName = 'Wochenplan_24';
        const calls: Array<Call> = processWeekplan(
            await getPdfFileData(fileName),
        );
        const expectedCalls = getExpectedData(fileName);
        expect(calls).toStrictEqual(expectedCalls);
    });
});
function reviveCallsFromJson(parsedArr: Array<Call>): Array<Call> {
    const expectedCalls: Call[] = [];
    for (let i = 0; i < parsedArr.length; i++) {
        parsedArr[i].start = new Date(parsedArr[i].start);
        parsedArr[i].end = new Date(parsedArr[i].end);
        expectedCalls.push(parsedArr[i]);
    }
    return expectedCalls;
}
async function getPdfFileData(fileName: string): Promise<string> {
    const filePath = path.join(__dirname, `./testFiles/${fileName}.pdf`);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}
async function getDocxFileData(fileName: string): Promise<string> {
    const filePath = path.join(__dirname, `./testFiles/${fileName}.docx`);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await mammoth.extractRawText({ buffer: dataBuffer });
    return data.value;
}
function getExpectedData(fileName: string): Call[] {
    const filePath = path.join(
        __dirname,
        `./testFiles/resObjFrom_${fileName}.json`,
    );
    const data = fs.readFileSync(filePath, 'utf8');
    return reviveCallsFromJson(JSON.parse(data));
}
