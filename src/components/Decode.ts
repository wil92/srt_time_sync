export interface SubLine {
    id: number;
    start: number; // in milliseconds
    end: number;   // in milliseconds
    text: string[];
}

export function trimEndAll(str: string): string {
    return str.replace(/[\r\n\t]+$/g, '');
}

export function parseId(line: string, lineNumber: number): number {
    line = trimEndAll(line);
    const id = parseInt(line.trim());
    const match = line.match(/^\d+$/);
    if (isNaN(id) || !match) {
        throw new Error(`Error parsing ID in line: ${lineNumber}, got "${line}"`);
    }
    return id;
}

export function parseTimeInterval(line: string, lineNumber: number): { start: number, end: number } {
    line = trimEndAll(line);
    const timeMatch = line.match(/(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3}) --> (\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})/);
    if (!timeMatch) {
        throw new Error(`Error parsing time interval in line: ${lineNumber}, got "${line}"`);
    }

    const start = parseInt(timeMatch[1]) * 3600000 + parseInt(timeMatch[2]) * 60000 + parseInt(timeMatch[3]) * 1000 + parseInt(timeMatch[4]);
    const end = parseInt(timeMatch[5]) * 3600000 + parseInt(timeMatch[6]) * 60000 + parseInt(timeMatch[7]) * 1000 + parseInt(timeMatch[8]);
    return {start, end};
}

export function fromSRT(srt: string): SubLine[] {
    const lines = srt.split('\n');
    const subs: SubLine[] = [];

    let i = 0;
    while (i < lines.length) {
        const id: number = parseId(lines[i], i + 1);
        i++;

        const {start, end} = parseTimeInterval(lines[i], i + 1);
        i++;

        const text: string[] = [];
        while (i < lines.length && trimEndAll(lines[i]) !== '') {
            text.push(lines[i]);
            i++;
        }

        subs.push({id, start, end, text} as SubLine);
        i++;
    }

    return subs;
}

export function toSRT(subs: SubLine[]): string {
    return subs.map(sub => {
        const timeString = `${toTimeString(sub.start)} --> ${toTimeString(sub.end)}`;
        const textString = sub.text.join('\n');
        return `${sub.id}\n${timeString}\n${textString}`;
    }).join('\n\n');
}

export function toTimeString(time: number): string {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    const mmm = milliseconds.toString().padStart(3, '0');

    return `${hh}:${mm}:${ss},${mmm}`;
}

export function toTimeNumber(timeString: string): number {
    const match = timeString.match(/(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})/);
    if (!match) {
        throw new Error(`Invalid time format: "${timeString}". Expected format: "HH:MM:SS,mmm"`);
    }

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    const milliseconds = parseInt(match[4]);

    return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
}
