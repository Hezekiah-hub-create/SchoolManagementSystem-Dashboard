import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

// lib/formValidationSchemas.ts
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores')
    .refine((val) => !val.startsWith('.') && !val.endsWith('.'),
      'Username cannot start or end with a dot'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  surname: z.string()
    .min(2, 'Surname must be at least 2 characters')
    .max(100, 'Surname too long'),
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address too long'),
  img: z.string().optional(),
  bloodType: z.string(),
  birthday: z.coerce.date().optional(),
  sex: z.enum(['MALE', 'FEMALE']),
  subjects: z.array(z.string()).optional(),

  // Password validation that matches Clerk requirements
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const teacherCreateSchema = teacherSchema.extend({
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
});

export type TeacherCreateSchema = z.infer<typeof teacherCreateSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().nullable(),
});

export const studentCreateSchema = studentSchema.extend({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  birthday: z.any().optional(),
  students: z.array(z.string()).optional(), // student ids
});

export const parentCreateSchema = parentSchema.extend({
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], { message: "Day is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teachers: z.array(z.string()).min(1, { message: "At least one teacher is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const assignmentFormSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.string().min(1, { message: "Start date is required!" }),
  dueDate: z.string().min(1, { message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentFormSchema = z.infer<typeof assignmentFormSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, { message: "Score must be a positive number!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
}).refine((data) => data.examId || data.assignmentId, {
  message: "Either exam or assignment must be selected!",
  path: ["examId"], // This will show the error on examId field
}).refine((data) => !(data.examId && data.assignmentId), {
  message: "Cannot select both exam and assignment!",
  path: ["examId"], // This will show the error on examId field
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const resultFormSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, { message: "Score must be a positive number!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
}).refine((data) => data.examId || data.assignmentId, {
  message: "Either exam or assignment must be selected!",
  path: ["examId"], // This will show the error on examId field
}).refine((data) => !(data.examId && data.assignmentId), {
  message: "Cannot select both exam and assignment!",
  path: ["examId"], // This will show the error on examId field
});

export type ResultFormSchema = z.infer<typeof resultFormSchema>;

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  present: z.boolean({ message: "Status is required!" }),
  lessonId: z.number({ message: "Lesson is required!" }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const eventFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  classId: z.string().min(1, { message: "Class is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
});

export type EventFormSchema = z.infer<typeof eventFormSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const announcementFormSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  classId: z.coerce.number().optional(),
});

export type AnnouncementFormSchema = z.infer<typeof announcementFormSchema>;

export const profileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required!" }),
  surname: z.string().min(1, { message: "Surname is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
});

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;

export const profileUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  surname: z.string().min(1, { message: "Surname is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Address is required!" }),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  // Role-specific fields (optional for flexibility)
  gradeId: z.coerce.number().optional(),
  classId: z.coerce.number().optional(),
  parentId: z.string().nullable().optional(),
  subjects: z.array(z.string()).optional(),
  students: z.array(z.string()).optional(),
});

export const financeSchema = z.object({
  id: z.coerce.number().optional(),
  type: z.enum(["income", "expense"], { message: "Type is required!" }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
});

export type FinanceSchema = z.infer<typeof financeSchema>;

export const financeFormSchema = z.object({
  id: z.coerce.number().optional(),
  type: z.enum(["income", "expense"], { message: "Type is required!" }),
  amount: z.string().min(1, { message: "Amount is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
});

export type FinanceFormSchema = z.infer<typeof financeFormSchema>;

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

// ==================== BILLING & INVOICE SCHEMAS ====================

export const invoiceItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required!" }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0!" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1!" }),
});

export const invoiceSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required!" }),
  totalAmount: z.coerce.number().min(0, { message: "Total amount is required!" }),
  dueDate: z.string().min(1, { message: "Due date is required!" }),
});

export type InvoiceSchema = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string().min(1, { message: "Invoice is required!" }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0!" }),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD"], { 
    message: "Payment method is required!" 
  }),
  transactionId: z.string().optional(),
  reference: z.string().optional(),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;

// ==================== SCHEME OF LEARNING SCHEMAS ====================

export const weekTopicSchema = z.object({
  week: z.number().min(1),
  topic: z.string().min(1, { message: "Topic is required!" }),
  subtopics: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
});

export const schemeOfLearningSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  teacherId: z.string().optional(),
  term: z.string().min(1, { message: "Term is required!" }),
  year: z.coerce.number().min(2020, { message: "Valid year is required!" }),
  weeks: z.array(weekTopicSchema).optional(),
  objectives: z.string().min(1, { message: "Objectives are required!" }),
});

export type SchemeOfLearningSchema = z.infer<typeof schemeOfLearningSchema>;

// ==================== CURRICULUM SCHEMAS ====================

export const curriculumTopicSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Topic name is required!" }),
  description: z.string().optional(),
  subtopics: z.array(z.string()).optional(),
  duration: z.number().optional(), // in weeks
});

export const curriculumSchema = z.object({
  id: z.string().optional(),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  topics: z.array(curriculumTopicSchema).optional(),
  objectives: z.string().min(1, { message: "Objectives are required!" }),
  outcomes: z.string().min(1, { message: "Outcomes are required!" }),
});

export type CurriculumSchema = z.infer<typeof curriculumSchema>;

// ==================== MESSAGE SCHEMAS ====================

export const messageSchema = z.object({
  id: z.string().optional(),
  senderId: z.string().optional(),
  senderType: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]).optional(),
  receiverId: z.string().min(1, { message: "Receiver is required!" }),
  receiverType: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"], { 
    message: "Receiver type is required!" 
  }),
  subject: z.string().min(1, { message: "Subject is required!" }),
  content: z.string().min(1, { message: "Message content is required!" }),
});

export type MessageSchema = z.infer<typeof messageSchema>;

// ==================== SUPPORT TICKET SCHEMAS ====================

export const ticketResponseSchema = z.object({
  content: z.string().min(1, { message: "Response content is required!" }),
});

export const supportTicketSchema = z.object({
  id: z.string().optional(),
  category: z.enum(["TECHNICAL", "ACADEMIC", "FINANCIAL", "ADMINISTRATIVE", "OTHER"], { 
    message: "Category is required!" 
  }),
  subject: z.string().min(1, { message: "Subject is required!" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters!" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
});

export type SupportTicketSchema = z.infer<typeof supportTicketSchema>;

// ==================== ACADEMIC REPORT SCHEMAS ====================

export const subjectScoreSchema = z.object({
  subjectId: z.number(),
  subjectName: z.string(),
  score: z.number().min(0).max(100),
  grade: z.string().optional(),
  comment: z.string().optional(),
});

export const academicReportSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  term: z.string().min(1, { message: "Term is required!" }),
  academicYear: z.coerce.number().min(2020, { message: "Valid year is required!" }),
  averageScore: z.coerce.number().min(0).max(100).optional(),
  classPosition: z.coerce.number().optional(),
  gradePosition: z.coerce.number().optional(),
  attendanceRate: z.coerce.number().min(0).max(100).optional(),
  teacherComments: z.string().optional(),
  principalComments: z.string().optional(),
  subjects: z.array(subjectScoreSchema).optional(),
});

export type AcademicReportSchema = z.infer<typeof academicReportSchema>;
