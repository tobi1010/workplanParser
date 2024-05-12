import {
    getFileType,
    getMonthName,
    pushConcat,
    replaceNthOccurrence,
    getMonthOffset,
} from '../utils';

describe('getFileType', () => {
    it('should return "weekplan" for all filenames including "weekplan" and e extension of .pdf', () => {
        let fileType = getFileType('wochenplan.pdf');
        expect(fileType).toBe('weekplan');
        fileType = getFileType('###wochenplan###.pdf');
        expect(fileType).toBe('weekplan');
    });
    it('should return "monthplan" for all filenames including "monthplan" and e extension of .pdf', () => {
        let fileType = getFileType('monatsplan.pdf');
        expect(fileType).toBe('monthplan');
        fileType = getFileType('###monatsplan###.pdf');
        expect(fileType).toBe('monthplan');
    });
    it('should return "yearplanDocx" for all filenames including "spielzeit" and e extension of .docx', () => {
        let fileType = getFileType('spielzeit.docx');
        expect(fileType).toBe('yearplanDocx');
        fileType = getFileType('###spielzeit###.docx');
        expect(fileType).toBe('yearplanDocx');
    });
    it('should return undefined for all other filenames', () => {
        let fileType = getFileType('spielzeit.pdf');
        expect(fileType).toBeUndefined();
        fileType = getFileType('###spielzeit###.pdf');
        expect(fileType).toBeUndefined();
    });
});
describe('getMonthName', () => {
    it('should return the correct full month name for all strings starting with the first three letters of that month', () => {
        let str = 'jan#############';
        let monthName = getMonthName(str);
        expect(monthName).toBe('januar');
        str = 'feb#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('februar');
        str = 'mär#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('märz');
        str = 'apr#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('april');
        str = 'mai#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('mai');
        str = 'jun#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('juni');
        str = 'jul#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('juli');
        str = 'aug#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('august');
        str = 'sep#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('september');
        str = 'okt#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('oktober');
        str = 'nov#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('november');
        str = 'dez#############';
        monthName = getMonthName(str);
        expect(monthName).toBe('dezember');
        str = '########';
        monthName = getMonthName(str);
        expect(monthName).toBe('');
    });
});
describe('pushConcat', () => {
    const condition = (curr: string, last: string) =>
        curr.charCodeAt(0) === last.charCodeAt(last.length - 1);
    it('should take an array of strings and return a new array with every two strings concatenated if the condition is true', () => {
        let arr = ['ab', 'cd', 'de', 'fg', 'gh'];
        let result = pushConcat(arr, condition);
        expect(result).toEqual(['ab', 'cdde', 'fggh']);
        arr = ['ab', 'cd', 'ef', 'gh'];
        result = pushConcat(arr, condition);
        expect(result).toEqual(['ab', 'cd', 'ef', 'gh']);
    });
    it('should return an empty array if the input array is empty', () => {
        const arr: string[] = [];
        const result = pushConcat(arr, condition);
        expect(result).toEqual([]);
    });
});
describe('replaceNthOccurrence', () => {
    it('should replace the nth occurrence of a substring in a string with a new substring', () => {
        let str = '_ab_ab_ab_ab_ab_ab_ab_';
        let newStr = replaceNthOccurrence(str, 'ab', 4, 'xx');
        expect(newStr).toBe('_ab_ab_ab_ab_xx_ab_ab_');
        newStr = replaceNthOccurrence(str, 'ab', 1, 'xx');
        expect(newStr).toBe('_ab_xx_ab_ab_ab_ab_ab_');
        newStr = replaceNthOccurrence(str, 'ab', 0, 'xx');
        expect(newStr).toBe('_xx_ab_ab_ab_ab_ab_ab_');
        str = '_ab_';
        newStr = replaceNthOccurrence(str, 'ab', 0, 'xx');
        expect(newStr).toBe('_xx_');
        str = '_ab_';
        newStr = replaceNthOccurrence(str, 'ab', 1, 'xx');
        expect(newStr).toBe('_ab_');
    });
    it('should return the original string if the substring does not occur n times', () => {
        const str = 'ababababababab';
        const newStr = replaceNthOccurrence(str, 'ab', 9, 'xx');
        expect(newStr).toBe(str);
    });
    it('should return an empty string if the input string is empty', () => {
        const str = '';
        const newStr = replaceNthOccurrence(str, 'ab', 4, 'xx');
        expect(newStr).toBe('');
    });
    it('should return the input string without the pattern if the replacement string is empty', () => {
        let str = '_ab_ab_ab_ab_ab_';
        let newStr = replaceNthOccurrence(str, 'ab', 4, '');
        expect(newStr).toBe('_ab_ab_ab_ab__');
        str = 'testxxxxtest';
        newStr = replaceNthOccurrence(str, 'xxxx', 0, '');
        expect(newStr).toBe('testtest');
    });
    it('should return string of length n+ diff(placeholder, pattern) if the placeholder is longer than the pattern', () => {
        const str = 'ababababab';
        const newStr = replaceNthOccurrence(str, 'ab', 2, 'xxxx');
        expect(newStr).toBe('abababxxxxab');
    });
});
describe('getMontOffset', () => {
    it('should return the correct offset value for a given month', () => {
        let mon = 'jan';
        let offset = getMonthOffset(mon);
        expect(offset).toBe(0);
        mon = 'febr';
        offset = getMonthOffset(mon);
        expect(offset).toBe(1);
        mon = 'märz';
        offset = getMonthOffset(mon);
        expect(offset).toBe(2);
        mon = 'MÄRZ';
        offset = getMonthOffset(mon);
        expect(offset).toBe(2);
        mon = 'dezember';
        offset = getMonthOffset(mon);
        expect(offset).toBe(11);
    });
});
