# Classroom Module - E-Learning System

Module quản lý lớp học online tương tự Google Classroom, tích hợp với hệ thống đăng ký môn học.

## 🎯 **Tính năng chính**

### **1. Auto-Create Classroom**
- Tự động tạo classroom khi sinh viên đăng ký môn học thành công
- Tự động thêm giáo viên và sinh viên vào classroom
- Generate class code và invite code unique

### **2. Classroom Management**
- Tạo/quản lý lớp học online
- Join lớp bằng invite code
- Quản lý thành viên (teacher, student, assistant)

### **3. ClassroomPost (Gộp Announcements + Materials)**
- Đăng thông báo quan trọng
- Chia sẻ tài liệu học tập
- Upload file đính kèm
- Pin post quan trọng

### **4. File Upload System**
- Upload nhiều loại file (PDF, DOC, IMAGE, VIDEO)
- Lưu trữ local với cấu trúc thư mục có tổ chức
- Validation file type và size
- Chuẩn bị sẵn cho S3/MinIO

## 📊 **Database Schema**

### **Entities:**
```
Classroom
├── id, course_id, name, description
├── class_code (unique), invite_code (unique)
└── is_active, created_at, updated_at

ClassroomPost (Gộp announcements + materials)
├── id, classroom_id, title, content
├── post_type (announcement/material/important)
├── attachments (JSON array)
├── created_by, is_pinned, view_count
└── created_at, updated_at

ClassroomMember
├── id, classroom_id, user_id
├── role (teacher/student/assistant)
├── joined_at, is_active
```

### **File Structure:**
```
uploads/
└── classroom/
    └── {classroom_id}/
        └── {year}/
            └── {month}/
                └── {uuid}.ext
```

## 🚀 **API Endpoints**

### **Classroom Management:**
```http
POST   /classrooms                     # Tạo classroom manual
GET    /classrooms/my-classrooms       # Danh sách classroom của user
GET    /classrooms/:id                 # Chi tiết classroom
POST   /classrooms/join                # Join bằng invite code
POST   /classrooms/auto-create         # Test auto-create
```

### **Posts & Materials:**
```http
POST   /classrooms/:id/posts           # Tạo post (có thể upload file)
GET    /classrooms/:id/posts           # Danh sách posts
PUT    /classrooms/:id/posts/:postId   # Cập nhật post
DELETE /classrooms/:id/posts/:postId   # Xóa post
```

### **File Upload:**
```http
POST   /classrooms/:id/posts           # Upload files cùng post
Content-Type: multipart/form-data
- files: File[]
- title: string
- content: string
- post_type: enum
```

## 💡 **Integration với Course Registration**

### **Auto-Create Flow:**
```typescript
// Trong CourseRegistrationService
async registerCourse(registerDto) {
  // ... existing registration logic ...
  
  if (registration.status === 'CONFIRMED') {
    // Auto create/join classroom
    await this.classroomService.autoCreateClassroom(
      registration.course_id,
      registration.student_id
    );
  }
}
```

## 🎨 **Usage Examples**

### **1. Auto-create classroom:**
```http
POST /classrooms/auto-create?course_id=1&student_id=1
```

### **2. Create announcement:**
```http
POST /classrooms/1/posts?creator_id=2
{
  "title": "Thông báo quan trọng",
  "content": "Lịch học thay đổi...",
  "post_type": "important",
  "is_pinned": true
}
```

### **3. Upload material with file:**
```http
POST /classrooms/1/posts?creator_id=2
Content-Type: multipart/form-data

title: "Slide bài giảng"
content: "Tài liệu cho buổi học hôm nay"
post_type: "material"
files: [file1.pdf, file2.docx]
```

### **4. Get classroom posts:**
```http
GET /classrooms/1/posts?user_id=1
```

## 🔧 **Technical Features**

### **File Upload:**
- **Supported types**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images, Videos, Audio, ZIP
- **Max size**: 10MB per file
- **Max files**: 5 files per request
- **Storage**: Local với structure `/uploads/classroom/{id}/{year}/{month}/`

### **Security:**
- Role-based permissions (Teacher, Student, Assistant)
- Classroom member validation
- File type validation
- File size limits

### **Performance:**
- Efficient queries với relations
- File organization by date
- Preparation for cloud storage

## 🚀 **Roadmap**

### **Phase 1: ✅ Completed**
- Basic classroom CRUD
- Auto-create integration
- ClassroomPost system
- File upload service
- Member management

### **Phase 2: 🔄 Next**
- Assignment system
- Grading functionality
- Real-time notifications
- Advanced file management

### **Phase 3: 📋 Future**
- Discussion threads
- Calendar integration
- Analytics dashboard
- Mobile app support

## 📈 **Benefits**

1. **Simplified Architecture** - Gộp announcements + materials thành 1 entity
2. **Easy Integration** - Auto-create khi đăng ký thành công
3. **Scalable File System** - Sẵn sàng cho cloud storage
4. **Modern UX** - Tương tự Google Classroom
5. **Performance Optimized** - Efficient database design

## 🎯 **Next Steps**

1. **Integrate với CourseRegistrationService** để auto-create
2. **Thêm Assignment module** cho bài tập
3. **Implement file serving** cho download
4. **Add real-time notifications** cho posts mới
5. **Create frontend dashboard** tương tự Google Classroom

Module này cung cấp foundation vững chắc cho một hệ thống e-learning hoàn chỉnh!