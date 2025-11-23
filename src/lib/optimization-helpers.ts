/**
 * Spring GraphQL形式からFastAPI形式への変換ヘルパー
 */

import type { OptimizeAnnualTimetableInput } from './fastapi-client'

/**
 * Spring GraphQLから取得したデータをFastAPI形式に変換
 */
export function convertGraphQLToFastAPI(
  graphqlData: GraphQLAnnualData,
  ttid: string,
  constraintDefinitions: ConstraintDefinition[]
): OptimizeAnnualTimetableInput {
  return {
    ttid,
    annualData: {
      schoolDays: graphqlData.schoolDays.map(sd => ({
        day: sd.dayOfWeek,
        available: sd.isAvailable,
        amPeriods: sd.amPeriods ?? undefined,
        pmPeriods: sd.pmPeriods ?? undefined,
      })),
      homerooms: graphqlData.homerooms.map(hr => ({
        id: hr.id,
        days: hr.homeroomDays.map(hd => ({
          day: hd.dayOfWeek,
          periods: hd.periods,
        })),
      })),
      instructors: graphqlData.instructors.map(inst => ({
        id: inst.id,
        days: inst.attendanceDays.map(ad => ({
          day: ad.dayOfWeek,
          unavailablePeriods: ad.unavailablePeriods,
        })),
      })),
      rooms: graphqlData.rooms.map(rm => ({
        id: rm.id,
      })),
      courses: graphqlData.courses.map(course => ({
        id: course.id,
        credits: course.subject.credits ?? 0,
        courseDetails: course.courseDetails.map(cd => ({
          instructorId: cd.instructor.id,
          roomId: cd.room?.id,
        })),
      })),
      curriculums: graphqlData.homerooms.map(hr => ({
        homeroomId: hr.id,
        blocks:
          hr.blocks?.map(block => ({
            id: block.id,
            lanes: block.lanes.map(lane => ({
              courseIds: lane.courses.map(c => c.id),
            })),
          })) ?? [],
      })),
    },
    constraintDefinitions,
  }
}

// GraphQL型定義（Spring APIの構造に合わせる）
export interface GraphQLAnnualData {
  schoolDays: GraphQLSchoolDay[]
  homerooms: GraphQLHomeroom[]
  instructors: GraphQLInstructor[]
  rooms: GraphQLRoom[]
  courses: GraphQLCourse[]
}

export interface GraphQLSchoolDay {
  id: string
  dayOfWeek: string
  isAvailable: boolean
  amPeriods?: number
  pmPeriods?: number
}

export interface GraphQLHomeroom {
  id: string
  homeroomName: string
  homeroomDays: GraphQLHomeroomDay[]
  blocks?: GraphQLBlock[]
}

export interface GraphQLHomeroomDay {
  id: string
  dayOfWeek: string
  periods: number
}

export interface GraphQLInstructor {
  id: string
  instructorName: string
  attendanceDays: GraphQLAttendanceDay[]
}

export interface GraphQLAttendanceDay {
  id: string
  dayOfWeek: string
  unavailablePeriods: number[]
}

export interface GraphQLRoom {
  id: string
  roomName: string
}

export interface GraphQLCourse {
  id: string
  courseName: string
  subject: {
    id: string
    credits?: number
  }
  courseDetails: GraphQLCourseDetail[]
}

export interface GraphQLCourseDetail {
  id: string
  instructor: {
    id: string
    instructorName: string
  }
  room?: {
    id: string
    roomName: string
  }
}

export interface GraphQLBlock {
  id: string
  blockName: string
  lanes: GraphQLLane[]
}

export interface GraphQLLane {
  id: string
  courses: {
    id: string
    courseName: string
  }[]
}

export interface ConstraintDefinition {
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number
  parameters?: Array<{
    key: string
    value: string
  }>
}
