import React, {useEffect, useState} from 'react';

import {type SubLine, fromSRT, toSRT, toTimeString, toTimeNumber} from './Decode.ts';

export function SubSync({}) {

    const [subtitles, setSubtitles] = useState<SubLine[]>([]);
    const [backgroundColor, setBackgroundColor] = useState<string>('white');
    const [timeShift, setTimeShift] = useState<string>('00:00:00,000');
    const [fileName, setFileName] = useState<string>('');
    const [intervalStart, setIntervalStart] = useState<number>(1);
    const [intervalEnd, setIntervalEnd] = useState<number>(1);

    useEffect(() => {
    }, []);

    const fileDropped = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setBackgroundColor('white');
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    console.log(e.target.result);
                    try {
                        const subRes = fromSRT(e.target.result as string);
                        setSubtitles(subRes);
                        setFileName(file.name);
                        setIntervalEnd(subRes[subRes.length - 1].id);
                    } catch (e) {
                        console.error(e);
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event?.preventDefault();
        setBackgroundColor('lightblue');
    }

    const dragOut = (event: React.DragEvent<HTMLDivElement>) => {
        event?.preventDefault();
        setBackgroundColor('white');
    }

    const saveFile = () => {
        const blob = new Blob([toSRT(subtitles)], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Handle time shift
    const timeshift = () => {
        const timeShiftValue = toTimeNumber(timeShift);

        for (let i = 0; i < subtitles.length; i++) {
            if (subtitles[i].id >= intervalStart && subtitles[i].id <= intervalEnd) {
                subtitles[i].start += timeShiftValue;
                subtitles[i].end += timeShiftValue;
            }
        }
        setSubtitles([...subtitles]);
    }

    return (<div className="flex flex-row">
        <div className="flex flex-col w-full overflow-y-auto max-h-screen min-h-screen"
             style={{minHeight: '300', backgroundColor}}
             onDragOver={dragOver}
             onDragLeave={dragOut}
             onDrop={fileDropped}>
            {subtitles.length === 0 ? <div>Drop your SRT file here</div> :
                subtitles.map((sub: SubLine) => (
                    <div key={sub.id}
                         className="border m-2 p-2">
                        <div className="flex flex-row justify-between">
                            {sub.id}
                            <div className="text-xs">
                                <button className="border mr-2 p-1"
                                        onClick={() => setIntervalStart(sub.id)}>BEGIN
                                </button>
                                <button className="border p-1"
                                        onClick={() => setIntervalEnd(sub.id)}>END
                                </button>
                            </div>
                        </div>
                        <div>{toTimeString(sub.start)} - {toTimeString(sub.end)}</div>
                        <div>
                            {sub.text.map((line, index) => (
                                <input className="border w-full"
                                       readOnly={true}
                                       key={index}
                                       value={line}/>))}
                        </div>
                    </div>
                ))
            }
        </div>
        <div>
            <h1 className="text-2xl mb-4">{fileName}</h1>
            <div className="flex flex-col w-50">
                <label htmlFor="time">Time shift</label>
                <input id="time"
                       value={timeShift}
                       onChange={(e) => setTimeShift(e.target.value)}
                       className="border"
                       type="text"/>
            </div>
            <div className="flex flex-row mt-4">
                <div className="flex flex-col w-full mr-2 max-w-40">
                    <label htmlFor="time">Begin</label>
                    <input id="time"
                           className="border"
                           value={intervalStart}
                           onChange={(e) => setIntervalStart(Number(e.target.value))}
                           type="text"/>
                </div>
                <div className="flex flex-col w-full max-w-40">
                    <label htmlFor="time">End</label>
                    <input id="time"
                           className="border"
                           value={intervalEnd}
                           onChange={(e) => setIntervalEnd(Number(e.target.value))}
                           type="text"/>
                </div>
            </div>
            <div className="mt-4">
                <button className="border mr-2 p-1"
                        onClick={timeshift}>
                    Sync!!!
                </button>
                <button className="border p-1"
                        onClick={saveFile}>
                    Save
                </button>
            </div>
        </div>
    </div>);
}
