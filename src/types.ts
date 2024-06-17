export type PlanType = 'weekplan' | 'monthplan' | 'yearplanDocx' | undefined;
// | 'yearplanPdf';

export type Call = {
    title: string;
    start: Date;
    end: Date;
    description: string;
};

export const Months = {
    januar: '00',
    februar: '01',
    märz: '02',
    april: '03',
    mai: '04',
    juni: '05',
    juli: '06',
    august: '07',
    september: '08',
    oktober: '09',
    november: '10',
    dezember: '11',
} as const;
export const Weekdays = {
    mo: 'mo',
    di: 'di',
    mi: 'mi',
    do: 'do',
    fr: 'fr',
    sa: 'sa',
    so: 'so',
} as const;
