# School Management System - Implementation Plan

## Overview
This plan implements all features from the requirements document, covering:
- Teaching/Teaching features
- Parent portal features  
- Finance management
- School Administration

---

## Phase 1: Database Schema Extensions

### 1.1 New Models to Add

```prisma
// Billing & Finance
model Invoice {
  id            String    @id @default(cuid())
  invoiceNumber String    @unique
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  items         InvoiceItem[]
  totalAmount   Float
  paidAmount    Float     @default(0)
  status        InvoiceStatus @default(PENDING)
  dueDate       DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  payments      Payment[]
}

model InvoiceItem {
  id          String  @id @default(cuid())
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id])
  description String
  amount      Float
  quantity    Int     @default(1)
}

enum InvoiceStatus {
  PENDING
  PARTIALLY_PAID
  PAID
  OVERDUE
  CANCELLED
}

model Payment {
  id              String    @id @default(cuid())
  invoiceId       String
  invoice         Invoice   @relation(fields: [invoiceId], references: [id])
  amount          Float
  paymentMethod   PaymentMethod
  transactionId   String?
  reference       String    @unique
  recordedById    String
  recordedBy      Teacher   @relation(fields: [recordedById], references: [id])
  createdAt       DateTime  @default(now())
}

enum PaymentMethod {
  CASH
  MOBILE_MONEY
  BANK_TRANSFER
  CARD
}

// Schemes of Learning
model SchemeOfLearning {
  id          String    @id @default(cuid())
  title       String
  subjectId   Int
  subject     Subject   @relation(fields: [subjectId], references: [id])
  classId     Int
  class       Class     @relation(fields: [classId], references: [id])
  teacherId   String
  teacher     Teacher   @relation(fields: [teacherId], references: [id])
  term        String
  year        Int
  weeks       Json      // Weekly breakdown of topics
  objectives  String    @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Curriculum
model Curriculum {
  id          String    @id @default(cuid())
  subjectId   Int
  subject     Subject   @relation(fields: [subjectId], references: [id])
  gradeId     Int
  grade       Grade     @relation(fields: [gradeId], references: [id])
  topics      Json      // Hierarchical topic structure
  objectives  String    @db.Text
  outcomes    String    @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Parent-Teacher Communication
model Message {
  id          String    @id @default(cuid())
  senderId     String
  senderType   UserType
  receiverId   String
  receiverType UserType
  subject      String
  content      String    @db.Text
  isRead      Boolean   @default(false)
  parentId     String?
  parent       Parent?   @relation(fields: [parentId], references: [id])
  createdAt   DateTime  @default(now())
}

enum UserType {
  ADMIN
  TEACHER
  STUDENT
  PARENT
}

// Academic Reports
model AcademicReport {
  id              String    @id @default(cuid())
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id])
  term            String
  academicYear    Int
  averageScore    Float
  classPosition   Int?
  gradePosition   Int?
  attendanceRate  Float
  teacherComments String    @db.Text
  principalComments String? @db.Text
  generatedAt     DateTime  @default(now())
  subjects        Json      // Subject-wise breakdown
}

// Support System
model SupportTicket {
  id          String    @id @default(cuid())
  userId      String
  userType    UserType
  category    SupportCategory
  subject     String
  description String    @db.Text
  status      TicketStatus @default(OPEN)
  priority    Priority  @default(MEDIUM)
  assignedTo  String?
  responses   TicketResponse[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  resolvedAt  DateTime?
}

model TicketResponse {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      SupportTicket @relation(fields: [ticketId], references: [id])
  responderId String
  responderType UserType
  content     String        @db.Text
  createdAt   DateTime      @default(now())
}

enum SupportCategory {
  TECHNICAL
  ACADEMIC
  FINANCIAL
  ADMINISTRATIVE
  OTHER
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// Automated Reminders
model ReminderLog {
  id          String        @id @default(cuid())
  type        ReminderType
  recipientId String
  recipientType UserType
  subject     String
  message     String        @db.Text
  sentAt      DateTime      @default(now())
  status      String        // SENT, FAILED
}

enum ReminderType {
  FEE_DUE
  PAYMENT_RECEIVED
  ATTENDANCE
  ACADEMIC_REPORT
  GENERAL
}
```

---

## Phase 2: API Routes & Server Actions

### 2.1 Invoice Management
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List invoices (with filters)
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Cancel invoice

### 2.2 Payment Processing
- `POST /api/payments` - Record payment
- `GET /api/payments` - List payments
- `GET /api/payments/receipt/[id]` - Generate receipt

### 2.3 Schemes of Learning
- `POST /api/schemes` - Create scheme
- `GET /api/schemes` - List schemes (by subject/class/teacher)
- `GET /api/schemes/[id]` - Get scheme details
- `PUT /api/schemes/[id]` - Update scheme
- `DELETE /api/schemes/[id]` - Delete scheme

### 2.4 Curriculum
- `POST /api/curriculum` - Add curriculum
- `GET /api/curriculum` - List curriculum (by grade/subject)
- `GET /api/curriculum/[id]` - Get curriculum details
- `PUT /api/curriculum/[id]` - Update curriculum

### 2.5 Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages (inbox/sent)
- `PUT /api/messages/[id]/read` - Mark as read
- `DELETE /api/messages/[id]` - Delete message

### 2.6 Academic Reports
- `POST /api/reports` - Generate report
- `GET /api/reports` - List reports (by student/term)
- `GET /api/reports/[id]` - Get report details

### 2.7 Support Tickets
- `POST /api/support` - Create ticket
- `GET /api/support` - List tickets
- `GET /api/support/[id]` - Get ticket details
- `POST /api/support/[id]/respond` - Add response
- `PUT /api/support/[id]` - Update ticket status

### 2.8 Finance Reports
- `GET /api/reports/finance/income-expenditure`
- `GET /api/reports/finance/balance-sheet`
- `GET /api/reports/finance/receivables`
- `GET /api/reports/finance/summary`

---

## Phase 3: Frontend Components & Pages

### 3.1 Teacher Dashboard Enhancements
- Homework/Assignment management
- Exam processing
- Schemes of Learning generator
- Curriculum browser

### 3.2 Parent Portal
- Student progress dashboard
- Attendance viewer
- Fee payment interface
- Message center
- Academic reports viewer
- Support ticket system

### 3.3 Finance Module
- Invoice management
- Payment recording
- Receipt generation
- Report dashboards

### 3.4 Admin Reports
- Board reports generator
- Financial reports
- Academic performance reports

---

## Phase 4: Key Features Implementation

### 4.1 Fee Payment from Mobile Money
- Integration placeholder for mobile money API
- Payment reference generation
- Instant receipt generation

### 4.2 Automated Reminders
- Scheduled job for overdue invoices
- Payment confirmation notifications
- Attendance alerts

### 4.3 BECE Performance Prediction
- Historical score analysis
- Performance trend calculation
- Prediction algorithm based on current scores

### 4.4 Schemes of Learning Generator
- Template-based generation
- Curriculum integration
- Auto-populate from curriculum topics
- Export to PDF

---

## Implementation Order

1. **Database Schema** - Add all new models and run migrations
2. **API Routes** - Implement all REST endpoints
3. **Server Actions** - Add CRUD operations
4. **Forms** - Create forms for new entities
5. **Pages** - Create list/detail pages
6. **Reports** - Implement finance and academic reports
7. **Notifications** - Set up automated reminders

---

## Dependencies to Add

```
json
{
  "additional-packages": [
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "date-fns": "^4.1.0",
    "node-cron": "^3.0.3"
  ]
}
```

---

## Files to Create/Modify

### New Files
- `prisma/migrations/add_billing_*` - Billing migrations
- `prisma/migrations/add_schemes_*` - Schemes migrations
- `prisma/migrations/add_communication_*` - Messages migrations
- `src/app/api/invoices/` - Invoice API
- `src/app/api/payments/` - Payment API
- `src/app/api/schemes/` - Schemes API
- `src/app/api/curriculum/` - Curriculum API
- `src/app/api/messages/` - Messages API
- `src/app/api/reports/` - Reports API
- `src/app/api/support/` - Support API
- `src/components/forms/InvoiceForm.tsx`
- `src/components/forms/PaymentForm.tsx`
- `src/components/forms/SchemeForm.tsx`
- `src/components/forms/CurriculumForm.tsx`
- `src/components/forms/MessageForm.tsx`
- `src/components/forms/ReportForm.tsx`
- `src/components/forms/SupportForm.tsx`
- `src/app/(dashboard)/list/invoices/page.tsx`
- `src/app/(dashboard)/list/payments/page.tsx`
- `src/app/(dashboard)/list/schemes/page.tsx`
- `src/app/(dashboard)/list/curriculum/page.tsx`
- `src/app/(dashboard)/list/messages/page.tsx`
- `src/app/(dashboard)/list/reports/page.tsx`
- `src/app/(dashboard)/list/support/page.tsx`

### Modified Files
- `prisma/schema.prisma` - Add new models
- `src/lib/actions.ts` - Add new server actions
- `src/lib/formValidationSchemas.ts` - Add validation
- `src/components/Menu.tsx` - Add new menu items
- `src/lib/data.ts` - Add static data
