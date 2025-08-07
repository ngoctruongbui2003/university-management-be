export class TimetableTestDto {
    message: string;
    timestamp: string;
    
    constructor() {
        this.message = 'Timetable module is working!';
        this.timestamp = new Date().toISOString();
    }
}