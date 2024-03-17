import * as fs from 'fs';
import * as ics from 'ics';
import { Call } from './types';

export default function createIcs(
  calls: Array<Call>,
  singleFiles: boolean,
  fileName: string,
): void {
  // adjust times: hours + 1
  calls.forEach((call) => {
    call.start.setHours(call.start.getHours() + 1);
    call.end.setHours(call.end.getHours() + 1);
  });

  if (singleFiles) {
    const currentDirectory = process.cwd();
    fs.mkdirSync(`${currentDirectory}/ics`, { recursive: true });
    let event: ics.EventAttributes;
    calls.forEach((call, i) => {
      event = {
        start: [
          call.start.getFullYear(),
          call.start.getMonth() + 1,
          call.start.getDate(),
          call.start.getHours(),
        ],
        duration: calculateDuration(call.start, call.end),
        title: call.title,
        description: call.description,
      };
      ics.createEvent(event, (error, value) => {
        if (error) {
          console.log(error);
        } else if (value) {
          fs.writeFileSync(
            `${currentDirectory}/ics/${fileName}_${i + 1}.ics`,
            value,
          );
        }
      });
    });
  } else {
    const { error, value } = ics.createEvents(
      calls.map((call) => ({
        start: [
          call.start.getFullYear(),
          call.start.getMonth() + 1,
          call.start.getDate(),
          call.start.getHours(),
        ],
        duration: calculateDuration(call.start, call.end),
        title: call.title,
        description: call.description,
      })),
    );
    if (error) {
      console.error(error);
    } else {
      if (value) {
        const currentDirectory = process.cwd();
        fs.mkdirSync(`${currentDirectory}/ics`, { recursive: true });
        fs.writeFileSync(
          `${currentDirectory}/ics/${fileName}.ics`,
          value,
        );
      }
    }
  }
}

function calculateDuration(
  start: Date,
  end: Date,
): { hours: number; minutes: number } {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return { hours: hours, minutes: minutes };
}
