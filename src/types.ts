export const PlanTypes = ['weekplan', 'monthplan', 'yearplanDocx'] as const;
export type Timeslots = 'morning' | 'evening';
export type Priorities = 0 | 1 | 2;
export type PlanType = (typeof PlanTypes)[number] | undefined;

// export type Call = {
//     title: string;
//     start: Date;
//     end: Date;
//     description: string;
// };

export class Call {
    public creationTS: number;
    public title: string;
    public start: Date;
    public end: Date;
    public timeslot: Timeslots;
    public description: string;
    public priority: Priorities;
    constructor(
        title: string,
        start: Date,
        end: Date,
        description: string,
        priority: Priorities,
    ) {
        this.creationTS = Date.now();
        if (title === '') {
            throw new Error('Title must not be empty');
        }
        this.title = title;
        if (start > end) {
            throw new Error('Start must be before end');
        }
        this.start = start;
        this.end = end;
        this.timeslot = this.start.getHours() < 15 ? 'morning' : 'evening';
        this.description = description;
        this.priority = priority;
    }
}

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
