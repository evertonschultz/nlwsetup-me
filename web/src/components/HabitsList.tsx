import * as Checkbox from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';

interface Props {
  date: Date;
  onCompletedChange: (completed: number) => void
}

interface HabitsInfoProps {
  possilbleHabits: Array<{
    id: string;
    title: string;
    created_at: string;
  }>,
  completedHabits: string[]
}

export function HabitsList({ date, onCompletedChange }: Props) {
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfoProps>()

  useEffect(() => {
    api.get('/day', {
      params: {
        date: date.toISOString(),
      }
    }).then((response) => {
      setHabitsInfo(response.data)
    })
  }, [])

  async function handleToggleHabit(habitId: string) {
    await api.patch(`/habits/${habitId}/toggle`)

    const isHabitAlreadyCompleted = habitsInfo?.completedHabits.includes(habitId)

    let completedHabits: string[] = []

    if(isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(id => id !== habitId)
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId]
    }

    setHabitsInfo({
      possilbleHabits: habitsInfo!.possilbleHabits,
      completedHabits
    })

    onCompletedChange(completedHabits.length)
  }

  const today = dayjs().startOf('day')
  const isDateInPast = dayjs(date).endOf('day').isBefore(today)

  return (
    <div className="mt-6 flex flex-col gap-3">
      {habitsInfo?.possilbleHabits.map(habit => {
        return (
          <Checkbox.Root
            key={habit.id}
            onCheckedChange={() => handleToggleHabit(habit.id)}
            checked={habitsInfo.completedHabits.includes(habit.id)}
            disabled={isDateInPast}
            className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-violet-600 group-data-[state=checked]:border-violet-600 transition-colors group-focus:ring-2 group-focus:ring-violet-500 group-focus:ring-offset-2 group-focus:ring-offset-background">
              <Checkbox.Indicator>
                <Check size={20} className="text-white" />
              </Checkbox.Indicator>
            </div>

            <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
              {habit.title}
            </span>
          </Checkbox.Root>
        )
      })}
      
    </div>
  )
}