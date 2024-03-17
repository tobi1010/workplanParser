import { PlanType } from './types';

export function logArray<T>(arr: Array<T>): void {
    arr.forEach((element) => {
        console.log(element);
    });
}

export function getFileNameNoExtensionNoPath(fileName: string): string {
    return fileName.split('/').pop()?.split('.')[0] as string;
}

export function getFileType(fileName: string): PlanType {
    const regexWeekplan = /.*wochenplan.*.pdf$/i;
    const regexMonthplan = /.*monatsplan.*.pdf$/i;
    const regexYearplanDocx = /.*spielzeit.*.docx$/i;
    const regexYearplanPdf = /.*spielzeit.*.pdf$/i;
    if (regexWeekplan.test(fileName)) {
        return 'weekplan';
    }
    if (regexMonthplan.test(fileName)) {
        return 'monthplan';
    }
    if (regexYearplanDocx.test(fileName)) {
        return 'yearplanDocx';
    }
    if (regexYearplanPdf.test(fileName)) {
        return 'yearplanPdf';
    }
    console.log('Invalid file type');
    process.exit(1);
}

export function getMonthName(
    str: string,
):
    | 'januar'
    | 'februar'
    | 'märz'
    | 'april'
    | 'mai'
    | 'juni'
    | 'juli'
    | 'august'
    | 'september'
    | 'oktober'
    | 'november'
    | 'dezember'
    | '' {
    const start = str.substring(0, 3).toLowerCase();
    switch (start) {
        case 'jan':
            return 'januar';
        case 'feb':
            return 'februar';
        case 'mär':
            return 'märz';
        case 'apr':
            return 'april';
        case 'mai':
            return 'mai';
        case 'jun':
            return 'juni';
        case 'jul':
            return 'juli';
        case 'aug':
            return 'august';
        case 'sep':
            return 'september';
        case 'okt':
            return 'oktober';
        case 'nov':
            return 'november';
        case 'dez':
            return 'dezember';
        default:
            return '';
    }
}
export function pushConcat(
    arr: Array<string>,
    condition: (curr: string, last: string) => boolean,
): Array<string> {
    if (arr.length === 0) {
        return [];
    }
    const result: Array<string> = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        if (condition(arr[i], arr[i - 1])) {
            result[result.length - 1] += arr[i];
        } else {
            result.push(arr[i]);
        }
    }
    return result;
}
