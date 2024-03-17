import { Call } from './types';

export default function processWeekplan(data: string): Array<Call> {
    const callsArr: Array<Call> = [];

    const regexWekdays =
        /Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag/g;
    const linesArr = data.split(regexWekdays);
    const lines: Array<string> = [];
    linesArr.forEach((line) => {
        line = line.replace(/!/g, ' ');
        let arr = line.split(/\n/g);
        arr = arr.filter((line) => line.trim() !== '');
        arr = arr.map((line) => line.trim());
        lines.push(...arr);
    });
    const regexDate = /^(\d{1,2}\.\d{1,2}\.)/g;
    const indicesDate: Array<number> = [];
    lines.forEach((line, index) => {
        if (regexDate.test(line.trim())) {
            indicesDate.push(index);
        }
    });
    //extract month and year from first date then remove it from indicesDate

    const dates = lines[indicesDate[0]].split('.');
    const month = dates[1].trim();
    const year = dates[dates.length - 1].trim();
    indicesDate.shift();

    const regexTime = /^(\d{1,2}:\d{2})/;
    const dayBlocks: Array<Array<string>> = [];
    for (let i = 0; i < indicesDate.length; i++) {
        if (i === indicesDate.length - 1) {
            dayBlocks.push(lines.slice(indicesDate[i]));
        } else {
            dayBlocks.push(lines.slice(indicesDate[i], indicesDate[i + 1]));
        }
    }
    dayBlocks.forEach((dayBlock) => {
        const dayStr = dayBlock[0].split('.')[0].trim();
        const day = dayStr.length === 1 ? `0${dayStr}` : dayStr;
        const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        let i = 1;
        while (i < dayBlock.length && regexTime.test(dayBlock[i])) {
            const firstSpace = dayBlock[i].indexOf(' ');
            const call = dayBlock[i].substring(firstSpace).trim();
            const hoursMinutes = dayBlock[1]
                .substring(0, firstSpace)
                .trim()
                .split(':');
            startDate.setHours(parseInt(hoursMinutes[0], 10));
            startDate.setMinutes(parseInt(hoursMinutes[1], 10));
            if (call.includes('OA')) {
                endDate.setHours(startDate.getHours() + 2);
                endDate.setMinutes(startDate.getMinutes() + 30);
            } else if (call.includes('VBO')) {
                endDate.setHours(startDate.getHours() + 4);
                endDate.setMinutes(startDate.getMinutes());
            } else {
                endDate.setHours(startDate.getHours() + 3);
                endDate.setMinutes(startDate.getMinutes());
            }
            callsArr.push({
                title: call,
                start: startDate,
                end: endDate,
                description: 'Wochenplan',
            });
            i++;
        }
    });
    return callsArr;
}