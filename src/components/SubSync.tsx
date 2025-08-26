import React, {useEffect, useState} from 'react';

interface SubLine {
    id: number;
    start: number; // in milliseconds
    end: number;   // in milliseconds
    text: string[];
}

export function parseId(line: string, lineNumber: number): number {
    const id = parseInt(line.trim());
    const match = line.match(/^\d+$/);
    if (isNaN(id) || !match) {
        throw new Error('Error parsing ID in line: ' + lineNumber);
    }
    return id;
}

export function parseTimeInterval(line: string, lineNumber: number): {start: number, end: number} {
    const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!timeMatch) {
        throw new Error('Error parsing time interval in line: ' + lineNumber);
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
        while (i < lines.length && lines[i].trim() !== '') {
            text.push(lines[i]);
            i++;
        }

        subs.push({id, start, end, text} as SubLine);
        i++;
    }

    return subs;
}

export function SubSync({}) {

    const [subtitles, setSubtitles] = useState<SubLine[]>([]);

    useEffect(() => {
    }, []);

    const fileDropped = (event: React.DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        event.preventDefault();
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    try {
                        setSubtitles(fromSRT(e.target.result as string));
                    } catch (_e) {
                        // show a notification error on the page
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    // Handle time shift
    const timeshift = () => {
    }

    return (<div className="flex flex-row">
        <div className="flex flex-col w-50">
            <label htmlFor="subs">Subtitles</label>
            <textarea className="border"
                      onDrop={fileDropped}
                      id="subs"></textarea>
        </div>
        <div className="flex flex-col w-50">
            <label htmlFor="time">Time shift</label>
            <input id="time"
                   className="border"
                   type="text"/>
        </div>
        <button className="border"
                onClick={timeshift}>
            Sync!!!
        </button>
    </div>);
}
