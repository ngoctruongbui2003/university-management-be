export enum UserRole {
    STUDENT = 'Student',
    TEACHER = 'Teacher',
    ADMIN = 'Admin',
    TRAINING_MANAGER = 'TrainingManager'
}

export enum Gender {
    MALE = 0,    // Nam
    FEMALE = 1,  // Nữ
    OTHER = 2    // Khác
}

export enum SemesterStatus {
    ACTIVE = 'Active',
    CLOSED = 'Closed'
}

export enum DayOfWeek {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 7
}

export enum RegistrationStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    CANCELLED = 'Cancelled',
    WAITLIST = 'Waitlist'
}
