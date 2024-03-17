import { Call } from './types';
import { Months, Weekdays } from './types';

export default function processMonthplan(data: string): Array<Call> {
    let linesArr = data.split('\n');
    // remove empty lines
    linesArr = linesArr.filter((line) => line.trim() !== '');
    // extract month and year from first line then remove it
    const monthString = linesArr[0].trim().split(' ')[0].toLowerCase();
    const month: string = Months[monthString as keyof typeof Months];
    const year: string = linesArr[0].trim().split(' ')[1];
    linesArr = linesArr.slice(1);
    // remove last two lines
    linesArr = linesArr.slice(0, linesArr.length - 2);
    // join back together so it can be split into days
    const line = linesArr.join(' ');
    // construct regex for day and weekday, case insensitive and global
    const dayPattern = Object.values(Weekdays).join('|');
    const regex = new RegExp(
        `\\b(0?[1-9]|[12][0-9]|3[01])\\s*(${dayPattern})\\s+`,
        'gi',
    );

    // find splitpoints with regex for day and weekday
    let matches: RegExpExecArray | null;
    const splitIndices = [];
    while ((matches = regex.exec(line)) !== null) {
        // store index of match as split point
        splitIndices.push(matches.index);
    }

    // Splitting the line into an array of lines based on the split points
    const daysArr = [];
    for (let i = 0; i < splitIndices.length - 1; i++) {
        const start = splitIndices[i];
        const end = splitIndices[i + 1];
        const substring = line.substring(start, end).trim();
        if (substring) {
            daysArr.push(substring);
        }
    }
    // Adding the last segment
    const lastSegment = line.substring(splitIndices[splitIndices.length - 1]);

    if (lastSegment) {
        daysArr.push(lastSegment);
    }

    const regexTime = /(\d{1,2}:\d{2})/g;
    const callsArr: Array<Call> = [];
    for (const day of daysArr) {
        const match = day.match(/\d{1,2}\s+/);
        const dayNum = match ? match[0].trim().padStart(2, '0') : '';
        const parts = day.split(regexTime);
        parts.shift();
        for (let i = 0; i < parts.length; i += 2) {
            const start = new Date(`${year}-${month}-${dayNum}T${parts[0]}`);
            const end = new Date(`${year}-${month}-${dayNum}T${parts[0]}`);
            if (/ OA(\s+|\s*\d+)/g.test(parts[i + 1])) {
                end.setHours(end.getHours() + 2);
                end.setMinutes(end.getMinutes() + 30);
            } else if (parts[0].includes(' VBO')) {
                end.setHours(end.getHours() + 4);
            } else {
                end.setHours(end.getHours() + 3);
            }
            callsArr.push({
                title: parts[i + 1].trim(),
                start,
                end,
                description: 'Monatsplan',
            });
        }
    }

    return callsArr;
}
