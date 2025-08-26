import {fromSRT, parseId, parseTimeInterval} from './SubSync.tsx'

describe('SubSync tests', () => {
    it('parses id correctly', () => {
        const srt = '1';
        const id = parseId(srt, 2);

        expect(id).toBe(1);
    });

    it('error with parsing id', () => {
        const srt = 'a';

        expect(() => parseId(srt, 9)).toThrow('Error parsing ID in line: ' + 9);
    });

    it('parses time interval correctly', () => {
        const srt = '00:00:01,000 --> 00:00:02,400';
        const {start, end} = parseTimeInterval(srt, 9);

        expect(start).toBe(1000);
        expect(end).toBe(2400);
    });

    it('error with parsing time interval', () => {
        const srt = '00:00:01,000 --> 00:00:02';

        expect(() => parseTimeInterval(srt, 9)).toThrow('Error parsing time interval in line: ' + 9);
    });

    it('parses SRT correctly', () => {
        const srt = `1
00:00:04,088 --> 00:00:06,556
El hambre, una vez dijo un poeta,

2
00:00:06,557 --> 00:00:09,993
es la cosa más importante que conocemos,

3
00:00:09,994 --> 00:00:12,028
la primera lección que aprendemos,
        `;

        const res = fromSRT(srt);

        expect(res).toHaveLength(3);
        expect(res[0]).toEqual({
            id: 1,
            start: 4088,
            end: 6556,
            text: ['El hambre, una vez dijo un poeta,']
        });
        expect(res[1]).toEqual({
            id: 2,
            start: 6557,
            end: 9993,
            text: ['es la cosa más importante que conocemos,']
        });
        expect(res[2]).toEqual({
            id: 3,
            start: 9994,
            end: 12028,
            text: ['la primera lección que aprendemos,']
        });
    });

    it('parses SRT with wrong id', () => {
        const srt = `1
00:00:04,088 --> 00:00:06,556
El hambre, una vez dijo un poeta,

2
00:00:06,557 --> 00:00:09,993
es la cosa más importante que conocemos,

3a
00:00:09,994 --> 00:00:12,028
la primera lección que aprendemos,
        `;

        expect(() => fromSRT(srt)).toThrow('Error parsing ID in line: ' + 9);
    });

    it('parses SRT with wrong time interval', () => {
        const srt = `1
00:00:04,088 --> 00:00:06,556
El hambre, una vez dijo un poeta,

2
00:00:06,557 --> 00:00:09,993
es la cosa más importante que conocemos,

3
00:00:09,994 --> 00:00:12028
la primera lección que aprendemos,
        `;

        expect(() => fromSRT(srt)).toThrow('Error parsing time interval in line: ' + 10);
    });

})
