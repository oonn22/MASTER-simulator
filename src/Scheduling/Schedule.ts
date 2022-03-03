import {SlotFrame} from "./SlotFrame.js";

/**A class representing a created  schedule. Schedule can only be accessed through its iterator*/
export class Schedule {
    private readonly schedule: SlotFrame[];

    constructor(schedule: SlotFrame[]) {
        this.schedule = schedule;
    }

    //Only way to access schedule is to use this iterator, is done this way as schedule
    //is created in reverse order
    [Symbol.iterator](): { next: () => { value: SlotFrame, done: boolean } } {
        let index = this.schedule.length;

        return {
            next: () => {
                index--;
                if (index >= 0) return {value: this.schedule[index], done: false};
                else return {value: this.schedule[0], done: true};
            }
        }
    }

    /** returns the number of timeslots used by this schedule */
    get length() {
        return this.schedule.length;
    }

    toString(timeSlotSize: number): string {
        let numChannels = this.schedule[0].numChannels;
        let display: string[] = [];
        let time = 0;

        for (let i = 0; i < numChannels; i++) {
            display[i] = i.toString() + "    ";
        }

        display[numChannels] = "     ";

        for (let slotFrame of this) {
            let largest = 0;

            for (let t of slotFrame.channels) {
                let tStr = t.toString()
                if (tStr.length > largest) largest = tStr.length;
            }

            for (let i = 0; i < numChannels; i++) {
                let channel = slotFrame.channels[i];

                if (channel === undefined) display[i] += " ".repeat(largest) + "   ";
                else {
                    let chnlStr = channel.toString();
                    display[i] += chnlStr + " ".repeat(largest - chnlStr.length) + "   ";
                }
            }

            let timeStr = time.toString();
            display[numChannels] += timeStr + " ".repeat(largest - timeStr.length) + "   ";
            time += timeSlotSize;
        }

        let s = "";

        for (let line of display) {
            s += line + "\n\n";
        }

        return s;
    }
}