import {fromSRT, parseId, parseTimeInterval, toSRT} from './Decode'

describe('Decode tests', () => {
    it('parses id correctly', () => {
        const srt = '1';
        const id = parseId(srt, 1);

        expect(id).toBe(1);
    });

    it('error with parsing id', () => {
        const srt = 'a';

        expect(() => parseId(srt, 9)).toThrow(`Error parsing ID in line: 9, got "a"`);
    });

    it('parses time interval correctly', () => {
        const srt = '00:00:01,000 --> 00:00:02,4';
        const {start, end} = parseTimeInterval(srt, 9);

        expect(start).toBe(1000);
        expect(end).toBe(2004);
    });

    it('parse time interval correctly with 2 digits in the milliseconds', () => {
        const srt = '00:00:01,00 --> 00:00:01,02';
        const {start, end} = parseTimeInterval(srt, 9);

        expect(start).toBe(1000);
        expect(end).toBe(1002);
    });

    it('error with parsing time interval', () => {
        const srt = '00:00:01,000 --> 00:00:';

        expect(() => parseTimeInterval(srt, 9)).toThrow(`Error parsing time interval in line: 9, got "00:00:01,000 --> 00:00:"`);
    });

    it('parses SRT correctly', () => {
        const srt = `1
0:00:04,088 --> 00:00:06,556
El hambre, una vez dijo un poeta,

2
00:0:06,557 --> 0:00:09,99
es la cosa más importante que conocemos,

3
00:00:09,994 --> 00:0:12,028
la primera lección que aprendemos,`;

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
            end: 9099,
            text: ['es la cosa más importante que conocemos,']
        });
        expect(res[2]).toEqual({
            id: 3,
            start: 9994,
            end: 12028,
            text: ['la primera lección que aprendemos,']
        });
    });

    it('parses SRT from and to correctly', () => {
        const srt = `1
00:00:04,088 --> 00:00:06,556
El hambre, una vez dijo un poeta,

2
00:00:06,557 --> 00:00:09,990
es la cosa más importante que conocemos,

3
00:00:09,994 --> 00:00:12,028
la primera lección que aprendemos,`;

        const res = fromSRT(srt);

        expect(res).toHaveLength(3);
        expect(toSRT(res)).toEqual(srt);
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
