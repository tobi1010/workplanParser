import { Call } from './types';
import { pushConcat, replaceNthOccurrence, getMonthOffset } from './utils';

const obstructors: Array<string> = ['OA', 'BO', 'VST.', 'PS'];

function fixDelimiters(
    delimiter: string,
    str: string,
    arr: Array<string>,
    neededLength: number,
): Array<string> {
    // takes the string and the parsed array.
    // checks in the array, where  wrong delimiters have been parsed
    // replaces the delimiters in the string with a placeholder
    // parses the string again and puts the delimiters back in the correct place
    const indicesToFix: Array<number> = [];
    for (let i = 0; i < arr.length; i++) {
        const splitStr = arr[i].split(' ');
        if (obstructors.includes(splitStr[splitStr.length - 1].trim())) {
            indicesToFix.push(i);
        }
    }

    const placeholder = '#&';
    indicesToFix.forEach((idx) => {
        str = replaceNthOccurrence(str, delimiter, idx + 1, placeholder);
    });

    const forceSpaceRegex = new RegExp(`${delimiter}(?= |$)`, 'g');
    const result: Array<string> = str
        .split(forceSpaceRegex)
        .map((el) => delimiter + ' ' + el.replace(/\bf(?= |$)/g, ' ').trim());
    result.shift();

    for (let i = 0; i < result.length; i++) {
        if (result[i].includes(placeholder)) {
            result[i] = result[i].replace(placeholder, delimiter);
        }
    }
    return result.length === neededLength ? result : [];
}

export default function processYearplanPdf(data: string): Array<Call> {
    const splitArr: string[] = data.split('\n');
    const splitIndices: Array<number> = [];
    const regexNum: RegExp = /^\d{1,2}/;
    const regexWeekday: RegExp = /^(mo|di|mi|do|fr|sa|so)/i;
    for (let i = 0; i < splitArr.length; i++) {
        const line = splitArr[i].trim();
        if (regexNum.test(line) || regexWeekday.test(line)) {
            splitIndices.push(i);
        }
    }
    // console.log(splitIndices);
    // splitIndices.forEach((idx) => console.log(splitArr[idx].trim()));
    const startingMonth = (
        splitArr[splitIndices[0] - 1].split(' ')[0] as string
    ).toLowerCase();
    const monthOffset = getMonthOffset(startingMonth);
    const yearMatch = splitArr[splitIndices[0] - 2].match(/\b\d{4}\b/);
    const year = yearMatch ? yearMatch[0] : '';
    const yearVal = monthOffset < 2 ? parseInt(year) : parseInt(year) + 1;
    const isLeapYear: boolean =
        yearVal % 4 === 0 && (yearVal % 100 !== 0 || yearVal % 400 === 0);

    const joinedArr: Array<string> = [];
    for (let i = 0; i < splitIndices.length - 1; i++) {
        let temp: string = '';
        for (let j = splitIndices[i]; j < splitIndices[i + 1]; j++) {
            temp += splitArr[j];
        }
        joinedArr.push(temp.trim());
    }
    joinedArr.push(
        splitArr.slice(splitIndices[splitIndices.length - 1]).join(''),
    );

    // joinedArr.forEach((el) => console.log(el));
    const fixedDaysArr: Array<string> = pushConcat(joinedArr, (curr, last) => {
        const matchCurr = regexNum.exec(curr.trim());
        const matchLast = regexNum.exec(last.trim());
        if (!matchCurr || !matchLast) return false;
        return matchCurr[0] === matchLast[0];
    });

    // console.log(allEveningsArr);

    // extract the morning calls to a separate array per day. arrays are sorted from starting month
    const morningCallArr: Array<Array<string>> = [];
    for (let i = 0; i < fixedDaysArr.length; i++) {
        if (regexNum.test(fixedDaysArr[i])) {
            const delimiter = fixedDaysArr[i].substring(
                0,
                fixedDaysArr[i].match(regexNum)![0].length,
            );
            const forceSpaceRegex = new RegExp(`${delimiter}(?= |$)`, 'g');
            const dateArr: Array<string> = fixedDaysArr[i]
                .split(forceSpaceRegex)
                .map(
                    (el) =>
                        delimiter + ' ' + el.replace(/\bf(?= |$)/g, ' ').trim(),
                );
            dateArr.shift();

            switch (delimiter) {
                case '29':
                    if (
                        (!isLeapYear && dateArr.length === 11) ||
                        (isLeapYear && dateArr.length === 12)
                    ) {
                        morningCallArr.push(dateArr);
                    } else {
                        morningCallArr.push(
                            fixDelimiters(
                                delimiter,
                                fixedDaysArr[i],
                                dateArr,
                                12,
                            ),
                        );
                    }
                    break;
                case '30':
                    if (dateArr.length === 11) {
                        morningCallArr.push(dateArr);
                    } else {
                        morningCallArr.push(
                            fixDelimiters(
                                delimiter,
                                fixedDaysArr[i],
                                dateArr,
                                12,
                            ),
                        );
                    }
                    break;
                case '31':
                    if (dateArr.length === 7) {
                        morningCallArr.push(dateArr);
                    } else {
                        morningCallArr.push(
                            fixDelimiters(
                                delimiter,
                                fixedDaysArr[i],
                                dateArr,
                                12,
                            ),
                        );
                    }
                    break;
                default:
                    if (dateArr.length === 12) {
                        morningCallArr.push(dateArr);
                    } else {
                        morningCallArr.push(
                            fixDelimiters(
                                delimiter,
                                fixedDaysArr[i],
                                dateArr,
                                12,
                            ),
                        );
                    }
                    break;
            }
        }
    }

    // console.log(morningCallArr);
    // fixedDaysArr.forEach((el) => console.log(el));
    const allEveningsArr: Array<string> = fixedDaysArr.filter((el) =>
        regexWeekday.test(el),
    );
    // allEveningsArr.forEach((el) => console.log(el));
    const eveningCallArr: Array<Array<string>> = [];

    const numDays = isLeapYear ? 29 : 28;
    for (let i = 0; i < numDays; i++) {
        eveningCallArr.push(allEveningsArr.slice(i * 12, (i + 1) * 12));
    }
    if (!isLeapYear) {
        let indexOfRemainingMonths = 12 * 28;
        eveningCallArr.push(
            allEveningsArr.slice(
                indexOfRemainingMonths,
                indexOfRemainingMonths + 11,
            ),
        );
        indexOfRemainingMonths += 11;
        eveningCallArr.push(
            allEveningsArr.slice(
                indexOfRemainingMonths,
                indexOfRemainingMonths + 11,
            ),
        );
        indexOfRemainingMonths += 11;
        eveningCallArr.push(
            allEveningsArr.slice(
                indexOfRemainingMonths,
                indexOfRemainingMonths + 7,
            ),
        );
    }
    if (isLeapYear) {
        let indexOfRemainingMonths = 12 * 29;
        eveningCallArr.push(
            allEveningsArr.slice(
                indexOfRemainingMonths,
                indexOfRemainingMonths + 11,
            ),
        );
        indexOfRemainingMonths += 11;
        eveningCallArr.push(
            allEveningsArr.slice(
                indexOfRemainingMonths,
                indexOfRemainingMonths + 7,
            ),
        );
    }

    // eveningCallArr.forEach((el) => console.log(el));
    const regNumDays = isLeapYear ? 29 : 28;
    const callsArray: Array<Call> = [];

    for (let i = 0; i < regNumDays; i++) {
        for (let j = 0; j < morningCallArr[i].length; j++) {
            console.log('--------------------');
            console.log(`${i + 1}.${((j + monthOffset) % 12) + 1}.${year}  `);
            console.log(morningCallArr[i][j]);
            console.log(eveningCallArr[i][j]);
            console.log('--------------------');

            // 29(if leap), 30, 31 need special treatment
        }
    }
    let monthZeroBased = monthOffset;
    if (!isLeapYear) {
        for (let i = 0; i < 11; i++) {
            console.log(morningCallArr[28][i]);
            console.log(eveningCallArr[28][i]);
            monthZeroBased++;
            if (monthZeroBased % 12 === 1) {
                monthZeroBased++;
            }
        }
    }
    monthZeroBased = monthOffset;
    for (let i = 0; i < 11; i++) {
        console.log(monthZeroBased % 12);
        console.log(morningCallArr[29][i]);
        console.log(eveningCallArr[29][i]);
        monthZeroBased++;
        if (monthZeroBased % 12 === 1) {
            monthZeroBased++;
        }
    }

    const longMonthMap = [0, 2, 4, 6, 7, 9, 11];
    const startIdx = longMonthMap.indexOf(Math.ceil(monthOffset));
    for (let i = 0; i < 7; i++) {
        const mon = longMonthMap[(startIdx + i) % 7];
        console.log(morningCallArr[30][i]);
        console.log(eveningCallArr[30][i]);
    }

    return [];
}
