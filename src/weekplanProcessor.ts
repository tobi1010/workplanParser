import { Call } from './types';

export default function processWeekplan(data: string): Call[] {
    const callsArr: Call[] = [];

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
            const title = dayBlock[i].substring(firstSpace).trim();
            const hoursMinutes = dayBlock[1]
                .substring(0, firstSpace)
                .trim()
                .split(':');
            startDate.setUTCHours(parseInt(hoursMinutes[0], 10));
            startDate.setUTCMinutes(parseInt(hoursMinutes[1], 10));
            if (title.includes('OA')) {
                endDate.setUTCHours(startDate.getUTCHours() + 2);
                endDate.setUTCMinutes(startDate.getUTCMinutes() + 30);
            } else if (title.includes('VBO')) {
                endDate.setUTCHours(startDate.getUTCHours() + 4);
                endDate.setUTCMinutes(startDate.getUTCMinutes());
            } else {
                endDate.setUTCHours(startDate.getUTCHours() + 3);
                endDate.setUTCMinutes(startDate.getUTCMinutes());
            }
            const call = new Call(title, startDate, endDate, 'Wochenplan', 0);

            callsArr.push(call);

            i++;
        }
    });
    return callsArr;
}
