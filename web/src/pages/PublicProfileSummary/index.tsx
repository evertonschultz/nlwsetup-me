import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { Route, Router, useParams } from "react-router-dom"
import { api } from "../../lib/axios"
import { generateDatesFromYearBeginning } from "../../utils/generate-dates-from-year-beginning"
import { HabitDay } from "./HabitDay"

const weekDays = [
  'D',
  'S',
  'T',
  'Q',
  'Q',
  'S',
  'S',
]

const summaryDates = generateDatesFromYearBeginning()

const minimunSummaryDatesSize = 18 * 7 // 18 weeks
const amountOfDaysToFill = minimunSummaryDatesSize - summaryDates.length

type Summary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}[]

type User = {
  id: string,
  name: string,
  email: string,
  avatarUrl: string,
  countHabits: number
}

export default function PublicProfileSummary() {
  const [summary, setSummary] = useState<Summary>([])
  const [user, setUser] = useState<User>({} as User)

  const { id } = useParams()

  useEffect(() => {
    try {
      api.get(`user/${id}`).then(response => {
        setSummary(response.data.summary)
        setUser(response.data.user)
      })
    } catch (error) {
      alert('Algo deu errado, tente novamente!')
    }

  }, [])

  if (!user.id) {
    return (
      <div className="w-full flex">
        <div className="grid grid-rows-7 grid-flow-row gap-3">
          <span>Usuário não encontrado</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-full max-w-5xl px-6 flex flex-col gap-5">
        <div className="flex gap-5 p-5">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-32 h-32 rounded-md"
          />
          <div className="flex flex-col gap-2">
            <strong className="text-gray-200 text-2xl">{user.name}</strong>
            <strong className="text-gray-200">{user.email}</strong>
            <div>
              <strong className="text-gray-200">{user.countHabits}</strong> <span className="text-gray-400 text-sm">hábitos criados</span>
            </div>
          </div>
        </div>

        <div className="w-full flex">
          <div className="grid grid-rows-7 grid-flow-row gap-3">
            {weekDays.map((weekDay, i) => {
              return (
                <div
                  key={`${weekDay}-${i}`}
                  className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
                >
                  {weekDay}
                </div>
              )
            })}
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-3">
            {summary.length > 0 && summaryDates.map(date => {
              const dayInSummary = summary.find(day => {
                return dayjs(date).isSame(day.date, 'day')
              })

              return (
                <HabitDay
                  key={date.toString()}
                  date={date}
                  amount={dayInSummary?.amount}
                  defaultCompleted={dayInSummary?.completed}
                />
              )
            })}

            {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => {
              return (
                <div
                  key={i}
                  className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40"
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}