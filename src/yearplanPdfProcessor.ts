import { Call, Weekdays } from './types';
import { pushConcat } from './utils';

const obstructions: Array<string> = ['OA', 'BO', 'Vst.', 'PS'];

export default function processYearplanPdf(data: string): Array<Call> {
    const splitArr: string[] = data.split('\n');
    const leapYear: boolean = true;
    const splitIndices: Array<number> = [];
    const regexNum: RegExp = /^\d{1,2}/;
    const regexWeekday: RegExp = /^(mo|di|mi|do|fr|sa|so)/i;
    for (let i = 0; i < splitArr.length; i++) {
        const line = splitArr[i].trim();
        if (regexNum.test(line) || regexWeekday.test(line)) {
            splitIndices.push(i);
        }
    }
    // console.log(splitArr);
    // console.log(splitIndices);
    // splitIndices.forEach((idx) => console.log(splitArr[idx].trim()));
    const joinedArr: Array<string> = [];
    for (let i = 0; i < splitIndices.length - 1; i++) {
        let temp: string = '';
        for (let j = splitIndices[i]; j < splitIndices[i + 1]; j++) {
            temp += splitArr[j];
        }
        joinedArr.push(temp.trim());
    }
    const fixedDaysArr: Array<string> = pushConcat(joinedArr, (curr, last) => {
        const matchCurr = regexNum.exec(curr.trim());
        const matchLast = regexNum.exec(last.trim());
        if (!matchCurr || !matchLast) return false;
        return matchCurr[0] === matchLast[0];
    });

    const morningMonthArr: Array<Array<string>> = [];
    for (let i = 0; i < fixedDaysArr.length; i++) {
        if (regexNum.test(fixedDaysArr[i])) {
            const delimiter = fixedDaysArr[i].substring(
                0,
                fixedDaysArr[i].match(regexNum)![0].length,
            );
            const dateArr: Array<string> = fixedDaysArr[i]
                .split(delimiter)
                .map((el) => delimiter + ' ' + el.replace(/ f /g, ' ').trim());
            dateArr.shift();
            // const pattern = `(?<!oa |oa|bo |bo|vst\\. |vst\\.|ps |ps)${delimiter}(?!\\S)`;
            /*  (?<!oa |bo |vst. ...): Negative lookbehind assertion to exclude cases where the number is preceded by 'OA ' or 'BO ...' (case-insensitive).
             *  ${delimiter}: Placeholder for the specific number.
             *  (?!\\S): Negative lookahead assertion to exclude cases where the number is followed by anything but a space.
             *  \S matches any non-whitespace character, so (?!\\S) ensures that the number is followed
             *  by a whitespace character (or the end of the string). */

            // const regex = new RegExp(pattern, 'gi');
            // const dateArr = fixedDaysArr[i]
            //     .split(regex)
            //     .map((segment) => delimiter + segment);
            switch (delimiter) {
                case '29':
                    if (
                        (!leapYear && dateArr.length === 11) ||
                        (leapYear && dateArr.length === 12)
                    ) {
                        morningMonthArr.push(dateArr);
                    } else {
                        console.log(
                            `delimiter: ${delimiter} \nlength: ${dateArr.length}`,
                        );
                        console.log(`string: \n${fixedDaysArr[i]}`);
                        console.log(dateArr);
                    }
                    break;
                case '30':
                    if (dateArr.length === 11) {
                        morningMonthArr.push(dateArr);
                    } else {
                        console.log(
                            `delimiter: ${delimiter} \nlength: ${dateArr.length}`,
                        );
                        console.log(`string: \n${fixedDaysArr[i]}`);
                        console.log(dateArr);
                    }
                    break;
                case '31':
                    if (dateArr.length === 7) {
                        morningMonthArr.push(dateArr);
                    } else {
                        console.log(
                            `delimiter: ${delimiter} \nlength: ${dateArr.length}`,
                        );
                        console.log(`string: \n${fixedDaysArr[i]}`);
                        console.log(dateArr);
                    }
                    break;
                default:
                    if (dateArr.length === 12) {
                        morningMonthArr.push(dateArr);
                    } else {
                        console.log(
                            `delimiter: ${delimiter} \nlength: ${dateArr.length}`,
                        );
                        console.log(`string: \n${fixedDaysArr[i]}`);
                        console.log(dateArr);
                    }
                    break;
            }
            // TODO replace occurences of delimiter after occurence of obstructor with # until there is a correct number of delimiters left
            // possibly write a function for this. at the end of the function replace # with delimiter again
            // console.log(dateArr);
            // morningMonthArr.push(dateArr);
        }
    }
    // console.log(morningMonthArr);
    // console.log(fixedDaysArr);
    return [];
}
