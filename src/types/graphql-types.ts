// GraphQLスキーマに基づく共通型定義
// GraphQLの特性上、クエリで指定したフィールドのみが返されるため、すべてのフィールドをoptionalにする

// 学校曜日
export interface GraphQLSchoolDay {
  id?: string
  ttid?: string
  dayOfWeek?: string
  isAvailable?: boolean
  amPeriods?: number | null
  pmPeriods?: number | null
}

// 勤怠曜日
export interface GraphQLAttendanceDay {
  id?: string
  instructor?: GraphQLInstructor
  dayOfWeek?: string
  unavailablePeriods?: number[]
}

// 教員
export interface GraphQLInstructor {
  id?: string
  ttid?: string
  instructorName?: string
  disciplineCode?: string
  attendanceDays?: GraphQLAttendanceDay[]
}

// 教室
export interface GraphQLRoom {
  id?: string
  ttid?: string
  roomName?: string
}

// 教科
export interface GraphQLDiscipline {
  disciplineCode?: string
  disciplineName?: string
}

// 学年
export interface GraphQLGrade {
  id?: string
  ttid?: string
  gradeName?: string
}

// 科目
export interface GraphQLSubject {
  id?: string
  ttid?: string
  discipline?: GraphQLDiscipline
  subjectName?: string
  credits?: number | null
  grade?: GraphQLGrade | null
  courses?: GraphQLCourse[]
}

// 学級曜日
export interface GraphQLHomeroomDay {
  id?: string
  dayOfWeek?: string
  periods?: number
  homeroom?: GraphQLHomeroom
}

// 学級
export interface GraphQLHomeroom {
  id?: string
  ttid?: string
  homeroomName?: string
  grade?: GraphQLGrade | null
  homeroomDays?: GraphQLHomeroomDay[]
  blocks?: GraphQLBlock[] | null
}

// ブロック
export interface GraphQLBlock {
  id?: string
  homeroomId?: string
  blockName?: string
  lanes?: GraphQLLane[]
}

// レーン
export interface GraphQLLane {
  id?: string
  blockId?: string
  courses?: GraphQLCourse[]
}

// 講座詳細
export interface GraphQLCourseDetail {
  id?: string
  course?: GraphQLCourse
  instructor?: GraphQLInstructor
  room?: GraphQLRoom | null
}

// 講座
export interface GraphQLCourse {
  id?: string
  subject?: GraphQLSubject
  courseName?: string
  lanes?: GraphQLLane[] | null
  courseDetails?: GraphQLCourseDetail[]
}

// 制約定義
export interface GraphQLConstraintDefinition {
  id?: string
  ttid?: string
  constraintDefinitionCode?: string
  softFlag?: boolean
  penaltyWeight?: number | null
  parameters?: unknown | null
}

// 制約パラメータマスタ
export interface GraphQLConstraintParameterMaster {
  parameterKey?: string
  parameterName?: string
  arrayFlag?: boolean
  optionList?: unknown | null
}

// 制約定義マスタ
export interface GraphQLConstraintDefinitionMaster {
  constraintDefinitionCode?: string
  constraintDefinitionName?: string
  description?: string | null
  mandatoryFlag?: boolean
  softFlag?: boolean
  parameterMasters?: GraphQLConstraintParameterMaster[]
}

// 時間割エントリ
export interface GraphQLTimetableEntry {
  id?: string
  timetableResult?: GraphQLTimetableResult
  homeroom?: GraphQLHomeroom
  dayOfWeek?: string
  period?: number
  course?: GraphQLCourse
}

// 制約違反
export interface GraphQLConstraintViolation {
  id?: string
  timetableResult?: GraphQLTimetableResult
  constraintViolationCode?: string
  violatingKeys?: unknown | null
}

// 時間割編成結果
export interface GraphQLTimetableResult {
  id?: string
  ttid?: string
  timetableEntries?: GraphQLTimetableEntry[]
  constraintViolations?: GraphQLConstraintViolation[]
}
