import { LogEntry, filterLogConsulting } from "./spreadsheet"
import { pipe, lt, prop, sum, map, filter } from "ramda"

export type Achievement = {
  name: string,
  description: string,
  icon?: string,
  predicate: (contractorLog: LogEntry[]) => boolean,
}

class Transform {
  static consulting = filter(filterLogConsulting)
  static count: ((l: LogEntry[]) => number) = pipe(map(prop('hours')), sum)
  static consultingHours = pipe(Transform.consulting, Transform.count)
}

export const candidateAchievements: Achievement[] = [
  {
    name: "Tirones",
    description: "Log your first consulting hour",
    predicate: pipe(Transform.consultingHours, lt(0))
  },
  {
    name: "Decurion",
    description: "Complete 10 consulting hours",
    predicate: pipe(Transform.consultingHours, lt(10))
  },
  {
    name: "Optio",
    description: "Complete 50 consulting hours",
    predicate: pipe(Transform.consultingHours, lt(50)),
  },
  {
    name: "Centurion",
    description: "Complete 100 consulting hours",
    predicate: pipe(Transform.consultingHours, lt(100)),
  },
  {
    name: "Tribunus Militum",
    description: "Complete 1000 consulting hours",
    predicate: pipe(Transform.consultingHours, lt(1000)),
  }
]

export type CheckedAchievement = Omit<Achievement, 'predicate'>

export function achievementsFromLog(log: LogEntry[]): CheckedAchievement[] {
  return candidateAchievements.filter(
    ({ predicate }) => predicate(log)).map(
      ({ name, description, icon }) => ({ name, description, icon }
    )
  )
}