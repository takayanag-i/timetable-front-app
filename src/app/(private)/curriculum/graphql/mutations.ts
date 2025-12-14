// GraphQL Mutation定義

export const UPSERT_HOMEROOMS = `
  mutation UpsertHomerooms($input: UpsertHomeroomsInput!) {
    upsertHomerooms(input: $input) {
      homeroomName
    }
  }
`

export const DELETE_HOMEROOM = `
  mutation DeleteHomeroom($id: ID!) {
    deleteHomeroom(id: $id)
  }
`

export const UPSERT_COURSES = `
  mutation UpsertCourses($input: UpsertCoursesInput!) {
    upsertCourses(input: $input) {
      id
      courseName
    }
  }
`

export const UPSERT_LANES = `
  mutation UpsertLanes($input: UpsertLanesInput!) {
    upsertLanes(input: $input) {
      id
      courses {
        id
        courseName
      }
    }
  }
`

export const UPSERT_BLOCKS = `
  mutation UpsertBlocks($input: UpsertBlocksInput!) {
    upsertBlocks(input: $input) {
      id
      blockName
    }
  }
`

export const DELETE_BLOCK = `
  mutation DeleteBlock($id: ID!) {
    deleteBlock(id: $id)
  }
`
