import { Call, Weekdays, Months } from './types';

export default function processYearplan(data: string): Array<Call> {
    const dataArr = data.split(/\n/g).filter((line) => line.trim() !== '');
    dataArr.pop(); // remove last line
    const firstDayIdx = dataArr.findIndex((line) => line === '1');
    const header = dataArr.slice(0, firstDayIdx);
    const planData = dataArr.slice(firstDayIdx);
    const match = header[0].match(/\b\d{4}\b/);
    const year = match ? match[0] : '';
    // console.log(header);
    const headLineWords = header[0].split(' ');
    const startingMonth =
        headLineWords[
            headLineWords.findIndex((y) => y === year) - 1
        ].toLowerCase();
    const monthOffset: number = parseInt(
        Months[startingMonth as keyof typeof Months],
    );

    const yearVal = monthOffset < 2 ? parseInt(year) : parseInt(year) + 1;
    const leapYear =
        yearVal % 4 === 0 && (yearVal % 100 !== 0 || yearVal % 400 === 0);

    //  rearrange data so that each line is a day
    let days: Array<string> = [];
    planData.forEach((line) => {
        const dayNum: number = parseInt(line.trim());
        if (!isNaN(dayNum) && dayNum < 32) {
            days.push(line);
        } else if (Object.keys(Weekdays).includes(line.trim().toLowerCase())) {
            days.push(line);
        } else {
            days[days.length - 1] += ` ${line}`;
        }
    });
    days = days.map((day) => {
        if (day.endsWith(' f')) {
            return (day = day.substring(0, day.length - 2));
        }
        return day;
    });
    // days.forEach((day) => console.log(day));
    const monthArr: Array<Array<string>> = Array.from({ length: 12 }, () => []);

    const dateIdcs: Array<number> = [];
    for (let i = 1; i < 32; i++) {
        dateIdcs.push(days.findIndex((line) => parseInt(line) === i));
    }
    const morning: Array<string> = [];
    const evening: Array<string> = [];
    days.forEach((line) => {
        if (/^\d{1,2}\s?.*?$/.test(line)) {
            // console.log(`morning: ${line}`);
            morning.push(line);
        }
        if (/^(mo|di|mi|do|fr|sa|so)\s?.*?$/i.test(line)) {
            // console.log(`evening: ${line}`);
            evening.push(line);
        }
    });
    const splitIdx: Array<number> = [0];
    for (let i = 2; i < 32; i++) {
        splitIdx.push(morning.findIndex((line) => line.startsWith(`${i}`)));
    }

    for (
        let i = 0;
        i < (leapYear ? splitIdx.length - 2 : splitIdx.length - 3); // Feb has 29 or 28 days
        i++
    ) {
        for (let mon = 0; mon < 12; mon++) {
            monthArr[(mon + monthOffset) % 12].push(morning[splitIdx[i] + mon]);
            monthArr[(mon + monthOffset) % 12].push(evening[splitIdx[i] + mon]);
        }
    }
    let idx = 0;
    if (!leapYear) {
        for (let mon = 0; mon < 12; mon++) {
            if ((mon + monthOffset) % 12 === 1) {
                mon++;
            }
            monthArr[(mon + monthOffset) % 12].push(
                morning[splitIdx[splitIdx.length - 3] + idx],
            );
            monthArr[(mon + monthOffset) % 12].push(
                evening[splitIdx[splitIdx.length - 3] + idx],
            );
            idx++;
        }
    }
    idx = 0;
    for (let mon = 0; mon < 12; mon++) {
        if ((mon + monthOffset) % 12 === 1) {
            mon++;
        }
        monthArr[(mon + monthOffset) % 12].push(
            morning[splitIdx[splitIdx.length - 2] + idx],
        );
        monthArr[(mon + monthOffset) % 12].push(
            evening[splitIdx[splitIdx.length - 2] + idx],
        );
        idx++;
    }
    const longMonthMap = [0, 2, 4, 6, 7, 9, 11];
    idx = 0;
    for (let i = 0; i < longMonthMap.length; i++) {
        monthArr[(longMonthMap[i] + monthOffset) % 12].push(
            morning[splitIdx[splitIdx.length - 1] + idx],
        );
        monthArr[(longMonthMap[i] + monthOffset) % 12].push(
            evening[splitIdx[splitIdx.length - 1] + idx],
        );
        idx++;
    }
    const callsArr: Array<Call> = [];

    const description = 'Vorschau - Uhrzeiten stimmen nicht!';
    const unicode160 = String.fromCharCode(160);

    monthArr.forEach((month, idx) => {
        const yyyy = idx >= monthOffset ? yearVal - 1 : yearVal;
        const mm = `${idx + 1}`.padStart(2, '0');

        for (let day = 0; day < month.length; day = day + 2) {
            const dd = `${day / 2 + 1}`.padStart(2, '0');

            if (month[day].trim().includes(' ')) {
                const title1 = month[day].substring(
                    month[day].indexOf(' ') + 1,
                );
                // console.log(`year: ${yyyy}, month: ${mm}, day: ${dd}`);
                const start = new Date(`${yyyy}-${mm}-${dd}T10:00:00Z`);
                const end = new Date(`${yyyy}-${mm}-${dd}T13:00:00Z`);

                callsArr.push({
                    title: title1,
                    start,
                    end,
                    description: description,
                });
            }

            if (month[day + 1].trim().includes(' ')) {
                const title2 = month[day + 1].substring(
                    month[day + 1].indexOf(' ') + 1,
                );
                const min =
                    title2.toLowerCase().startsWith(`wa${unicode160}`) ||
                    title2.toLowerCase().includes(`prem${unicode160}`) ||
                    title2.toLowerCase().includes(`vst.${unicode160}`)
                        ? '30'
                        : '00';
                const end = new Date(`${yyyy}-${mm}-${dd}T19:${min}:00Z`);
                end.setUTCHours(end.getUTCHours() + 3);

                callsArr.push({
                    title: title2,
                    start: new Date(`${yyyy}-${mm}-${dd}T19:${min}:00Z`),
                    end: end,
                    description: description,
                });
            }
        }
    });

    callsArr.forEach((call) => console.log(call));
    return callsArr;
}
