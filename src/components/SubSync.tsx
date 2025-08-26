import React, {useEffect, useState} from 'react';

import {type SubLine, fromSRT, toSRT} from './Decode.ts';

export function SubSync({}) {

    const [subtitles, setSubtitles] = useState<SubLine[]>([]);
    const [backgroundColor, setBackgroundColor] = useState<string>('white');
    const [timeShift, setTimeShift] = useState<string>('00:00:00,000');
    const [fileName, setFileName] = useState<string>('');

    useEffect(() => {
    }, []);

    const fileDropped = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setBackgroundColor('white');
        console.log('File dropped', event);
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    try {
                        setSubtitles(fromSRT(e.target.result as string));
                        setFileName(file.name);
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
        console.log('asdfasdf')
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
                        <div>{sub.id}</div>
                        <div>{sub.start} - {sub.end}</div>
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
            <h2>{fileName}</h2>
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
            <button className="border"
                    onClick={saveFile}>
                Save
            </button>
        </div>
    </div>);
}
