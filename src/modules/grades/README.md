# Grades Module - Hệ thống Chấm điểm

Module quản lý chấm điểm cho sinh viên trong classroom, tích hợp với GradingFormula và GradeType có sẵn.

## 🎯 **Tính năng chính**

### **1. Grade Book Management**
- Tạo đợt chấm điểm theo GradeType (CC, GK, CK)
- Quản lý tiến độ chấm điểm
- Publish/Unpublish điểm cho sinh viên

### **2. Grade Input**
- Nhập điểm đơn lẻ cho từng sinh viên
- Nhập điểm hàng loạt (batch input)
- Validation điểm số và quyền hạn
- Comments và feedback cho từng điểm

### **3. Grade Book Overview**
- Sổ điểm tổng quan của lớp
- Ma trận điểm (students × grade types)
- Thống kê và phân tích điểm
- Export Excel/CSV

### **4. Final Grade Calculation**
- Tính điểm cuối kỳ theo công thức GradingFormula
- Weighted average dựa trên weight của GradeType
- Letter grade conversion (A, B, C, D, F)
- Ranking và percentile

## 📊 **Database Schema**

### **Entities:**

#### **StudentGrade**
```typescript
{
  id, classroom_id, student_id, grade_type_id
  score, max_score, comments
  graded_by, graded_at
  is_final, is_published
}
```

#### **GradeBookEntry**
```typescript
{
  id, classroom_id, grade_type_id
  title, description, max_score
  created_by, due_date
  is_published, is_finalized
  total_students, graded_students (cached)
}
```

### **Relationships:**
```
Classroom → GradeBookEntry → StudentGrade
Course → Subject → GradingFormula → GradeType
StudentGrade → GradeType (weight %)
```

## 🚀 **API Endpoints**

### **Grade Book Entries Management:**
```http
POST   /classrooms/:id/grades/entries        # Tạo đợt chấm điểm
GET    /classrooms/:id/grades/entries        # Danh sách đợt chấm điểm
PUT    /classrooms/:id/grades/entries/:id    # Cập nhật đợt chấm điểm
DELETE /classrooms/:id/grades/entries/:id    # Xóa đợt chấm điểm
```

### **Grade Input:**
```http
POST   /classrooms/:id/grades/single         # Nhập điểm đơn lẻ
POST   /classrooms/:id/grades/batch          # Nhập điểm hàng loạt
PUT    /classrooms/:id/grades/:gradeId       # Cập nhật điểm
```

### **Grade Views:**
```http
GET    /classrooms/:id/grades/gradebook      # Sổ điểm tổng quan
GET    /classrooms/:id/grades/student/:id    # Điểm của 1 sinh viên
GET    /classrooms/:id/grades/statistics     # Thống kê điểm
GET    /classrooms/:id/grades/export         # Export Excel/CSV
```

### **Final Grade Calculation:**
```http
POST   /classrooms/:id/grades/calculate-final  # Tính điểm cuối kỳ
```

## 💡 **Usage Examples**

### **1. Tạo đợt chấm điểm:**
```http
POST /classrooms/1/grades/entries?teacher_id=2
{
  "grade_type_id": 1,  // CC (Chuyên cần)
  "title": "Điểm chuyên cần tuần 1-4",
  "max_score": 10,
  "is_published": false
}
```

### **2. Nhập điểm hàng loạt:**
```http
POST /classrooms/1/grades/batch?teacher_id=2
{
  "grade_book_entry_id": 1,
  "grades": [
    {"student_id": 1, "score": 8.5, "comments": "Tốt"},
    {"student_id": 2, "score": 7.0, "comments": "Khá"}
  ],
  "is_published": true
}
```

### **3. Xem sổ điểm:**
```http
GET /classrooms/1/grades/gradebook?user_id=2
```

### **4. Tính điểm cuối kỳ:**
```http
POST /classrooms/1/grades/calculate-final?teacher_id=2
{
  "include_incomplete": false,
  "save_as_final": true
}
```

## 🔧 **Features chi tiết**

### **Grade Input Validation:**
- Score range: 0.00 - max_score (usually 10.00)
- Teacher permission check
- Student membership validation
- Duplicate grade prevention
- Finalization protection

### **Batch Operations:**
- Bulk grade input với error handling
- Transaction support (all or nothing)
- Progress tracking
- Individual error reporting

### **Grade Calculation:**
- Weighted average theo GradeType weight
- Missing grade handling
- Final grade caching
- Letter grade conversion:
  - A: 8.5-10
  - B: 7.0-8.4
  - C: 5.5-6.9
  - D: 4.0-5.4
  - F: 0-3.9

### **Permissions:**
- **Teacher**: Full CRUD access
- **Assistant**: Limited input access
- **Student**: View own grades only

## 📈 **Advanced Features**

### **Statistics & Analytics:**
- Grade distribution charts
- Class performance metrics
- Student ranking
- Trend analysis
- Comparative analytics

### **Export Features:**
- Excel templates
- CSV format
- PDF reports
- Grade transcripts
- Bulk download

### **Notification Integration:**
- New grade notifications
- Grade change alerts
- Deadline reminders
- Performance warnings

## 🎯 **Integration Points**

### **Với Classroom:**
- Auto-populate students từ ClassroomMember
- Permission inheritance từ classroom roles
- Seamless navigation trong classroom dashboard

### **Với GradingFormula:**
- Sử dụng existing GradeType và weight
- Respect công thức tính điểm của Subject
- Maintain consistency với academic standards

### **Với Notification System:**
- Real-time updates cho grade changes
- Email notifications cho new grades
- Mobile push notifications

## 🚧 **Roadmap**

### **Phase 1: ✅ Completed**
- Core entities (StudentGrade, GradeBookEntry)
- Basic CRUD operations
- Single & batch grade input
- Permission system
- Basic validation

### **Phase 2: 🔄 Next Steps**
- Complete gradebook overview implementation
- Export functionality
- Advanced statistics
- Update/Delete operations

### **Phase 3: 📋 Future**
- Real-time notifications
- Advanced analytics
- Mobile app integration
- AI-powered grade insights

## 🎨 **UI/UX Concepts**

### **Grade Input Interface:**
```
┌─────────────────────────────────────────┐
│ Nhập điểm: Kiểm tra giữa kỳ (GK - 30%)  │
├─────────────────────────────────────────┤
│ [✓] Sinh viên A    │ 8.5  │ Tốt        │
│ [✓] Sinh viên B    │ 7.0  │ Khá        │
│ [ ] Sinh viên C    │ ___  │ __________ │
├─────────────────────────────────────────┤
│ Progress: 2/3 (67%) [Lưu] [Publish]     │
└─────────────────────────────────────────┘
```

### **Grade Book Matrix:**
```
┌─────────────────────────────────────────┐
│ SỔ ĐIỂM LỚP CS101-2024                  │
├─────────────────────────────────────────┤
│        │CC(20%)│GK(30%)│CK(50%)│TB│Rank│
│ Nguyễn A│ 8.5   │ 7.5   │ 8.0   │8.0│ 2 │
│ Trần B  │ 7.0   │ 8.0   │ 9.0   │8.3│ 1 │
│ Lê C    │ 9.0   │ 8.5   │ ___   │ - │ - │
├─────────────────────────────────────────┤
│ TB lớp: │ 8.17  │ 8.0   │ 8.5   │8.2│   │
└─────────────────────────────────────────┘
```

## 🎉 **Benefits**

1. **Paperless Grading** - Số hóa hoàn toàn quy trình chấm điểm
2. **Automated Calculation** - Tính toán tự động theo công thức
3. **Real-time Transparency** - Sinh viên xem điểm ngay lập tức
4. **Data-Driven Insights** - Analytics giúp cải thiện học tập
5. **Scalable System** - Mở rộng cho nhiều trường đại học

Module này hoàn thiện hệ thống e-learning với đầy đủ tính năng chấm điểm chuyên nghiệp!