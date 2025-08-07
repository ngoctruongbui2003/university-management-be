# Timetable Module - Hướng dẫn sử dụng

Module quản lý thời khóa biểu sinh viên trong hệ thống quản lý đại học.

## Các tính năng chính

### 1. Xem thời khóa biểu theo tuần
- **Endpoint**: `GET /timetable/student/:studentId/weekly`
- **Mô tả**: Lấy thời khóa biểu của sinh viên theo tuần
- **Parameters**:
  - `studentId` (path): ID của sinh viên
  - `semester_id` (query, optional): ID học kỳ
  - `week_start_date` (query, optional): Ngày bắt đầu tuần (YYYY-MM-DD)
  - `week_end_date` (query, optional): Ngày kết thúc tuần (YYYY-MM-DD)

**Ví dụ response**:
```json
{
  "week_start_date": "2024-01-15",
  "week_end_date": "2024-01-21",
  "semester_name": "Học kỳ 1 năm 2023-2024",
  "student_name": "Nguyễn Văn A",
  "student_code": "1",
  "days": [
    {
      "day_of_week": 1,
      "day_name": "Thứ 2",
      "date": "2024-01-15",
      "periods": [
        {
          "period_number": 1,
          "period_time": "07:00-07:50",
          "course": {
            "id": 1,
            "class_code": "CS101",
            "subject_name": "Lập trình căn bản",
            "teacher_name": "TS. Nguyễn Văn B",
            "room": "B101",
            "period_start": 1,
            "period_end": 2,
            "week_start": 1,
            "week_end": 15
          }
        }
      ]
    }
  ]
}
```

### 2. Xem thời khóa biểu hiện tại
- **Endpoint**: `GET /timetable/student/:studentId/current`
- **Mô tả**: Lấy thời khóa biểu tuần hiện tại của sinh viên

### 3. Xem thời khóa biểu theo ngày
- **Endpoint**: `GET /timetable/student/:studentId/date/:date`
- **Mô tả**: Lấy thời khóa biểu của một ngày cụ thể
- **Parameters**:
  - `date` (path): Ngày cần xem (YYYY-MM-DD)

### 4. Tổng quan thời khóa biểu học kỳ
- **Endpoint**: `GET /timetable/student/:studentId/overview`
- **Mô tả**: Lấy tổng quan thời khóa biểu cả học kỳ
- **Response**: Danh sách tất cả môn học và lịch học trong học kỳ

### 5. Kiểm tra xung đột lịch học
- **Endpoint**: `GET /timetable/student/:studentId/conflicts`
- **Mô tả**: Kiểm tra các xung đột lịch học giữa các môn
- **Response**: Danh sách các xung đột (nếu có)

**Ví dụ response**:
```json
[
  {
    "course1": {
      "id": 1,
      "class_code": "CS101",
      "subject_name": "Lập trình căn bản"
    },
    "course2": {
      "id": 2,
      "class_code": "MATH101",
      "subject_name": "Toán cao cấp"
    },
    "conflict_details": {
      "day_of_week": 2,
      "day_name": "Thứ 3",
      "period_start": 3,
      "period_end": 4,
      "week_overlap": {
        "start": 5,
        "end": 10
      }
    }
  }
]
```

### 6. Thống kê thời khóa biểu
- **Endpoint**: `GET /timetable/student/:studentId/statistics`
- **Mô tả**: Lấy thống kê chi tiết về thời khóa biểu
- **Response**: 
  - Tổng số môn học, tín chỉ, tiết học
  - Thống kê theo ngày và theo tiết
  - Ngày bận nhất, các tiết trống

### 7. Xem thời khóa biểu nhiều sinh viên
- **Endpoint**: `GET /timetable/multiple-students`
- **Mô tả**: Lấy thời khóa biểu của nhiều sinh viên (dành cho giáo viên/quản lý)
- **Parameters**:
  - `student_ids` (query): Danh sách ID sinh viên cách nhau bởi dấu phẩy

### 8. Test module
- **Endpoint**: `GET /timetable/test`
- **Mô tả**: Kiểm tra module hoạt động

## Cấu trúc dữ liệu

### Tiết học (Period)
- **period_number**: Số thứ tự tiết (1-12)
- **period_time**: Thời gian tiết học (VD: "07:00-07:50")
- **course**: Thông tin môn học (có thể null nếu tiết trống)

### Khung thời gian tiết học
1. Tiết 1: 07:00-07:50
2. Tiết 2: 08:00-08:50
3. Tiết 3: 09:00-09:50
4. Tiết 4: 10:00-10:50
5. Tiết 5: 11:00-11:50
6. Tiết 6: 13:00-13:50
7. Tiết 7: 14:00-14:50
8. Tiết 8: 15:00-15:50
9. Tiết 9: 16:00-16:50
10. Tiết 10: 17:00-17:50
11. Tiết 11: 18:00-18:50
12. Tiết 12: 19:00-19:50

### Ngày trong tuần
- 1: Thứ 2 (Monday)
- 2: Thứ 3 (Tuesday)
- 3: Thứ 4 (Wednesday)
- 4: Thứ 5 (Thursday)
- 5: Thứ 6 (Friday)
- 6: Thứ 7 (Saturday)
- 7: Chủ nhật (Sunday)

## Xử lý lỗi

Module sẽ trả về các lỗi thường gặp:
- **404 Not Found**: Sinh viên không tồn tại
- **404 Not Found**: Học kỳ không tồn tại
- **404 Not Found**: Không có học kỳ active
- **400 Bad Request**: Tham số không hợp lệ

## Phụ thuộc

Module này phụ thuộc vào:
- **Registration**: Đăng ký môn học của sinh viên
- **Course**: Thông tin môn học
- **CourseSchedule**: Lịch học của môn học
- **Student**: Thông tin sinh viên
- **Semester**: Thông tin học kỳ
- **Subject**: Thông tin môn học
- **Teacher**: Thông tin giáo viên

## Ghi chú

- Module tự động tính tuần hiện tại nếu không chỉ định `week_start_date`
- Chỉ hiển thị các môn học đã được xác nhận đăng ký (status = 'Confirmed')
- Hỗ trợ kiểm tra xung đột lịch học tự động
- Thống kê chi tiết giúp sinh viên quản lý thời gian học tập hiệu quả