/**
 * Spring GraphQL形式からFastAPI形式への変換ヘルパー
 */

import type {
  OptimizeAnnualTimetableRequest,
  ConstraintDefinition,
} from './fastapi-client'
import type { GraphQLAnnualDataType } from '@/app/api/optimize/graphql/types'

/**
 * Spring GraphQLから取得したデータをFastAPI形式に変換
 */
export function convertGraphQLToFastAPI(
  graphqlData: GraphQLAnnualDataType,
  ttid: string,
  constraintDefinitions: ConstraintDefinition[]
): OptimizeAnnualTimetableRequest {
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
      courses: graphqlData.subjects.flatMap(subject =>
        subject.courses.map(course => ({
          id: course.id,
          credits: subject.credits ?? 0,
          courseDetails: course.courseDetails.map(cd => ({
            instructorId: cd.instructor.id,
            roomId: cd.room?.id,
          })),
        }))
      ),
      curriculums: graphqlData.homerooms.map(hr => ({
        homeroomId: hr.id,
        blocks: (hr.blocks || []).map(block => ({
          id: block.id,
          lanes: block.lanes.map(lane => ({
            courseIds: lane.courses.map(c => c.id),
          })),
        })),
      })),
    },
    constraintDefinitions,
  }
}
