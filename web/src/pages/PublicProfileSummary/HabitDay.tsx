import clsx from 'clsx';

interface HabitDayProps {
  date: Date
  defaultCompleted?: number
  amount?: number
}

export function HabitDay({ defaultCompleted = 0, amount = 0, date }: HabitDayProps) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0

  return (
    <div className={clsx("w-10 h-10 border-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-background", {
      'bg-zinc-900 border-zinc-800': completedPercentage === 0,
      'bg-violet-900 border-violet-700': completedPercentage > 0 && completedPercentage < 20,
      'bg-violet-800 border-violet-600': completedPercentage >= 20 && completedPercentage < 40,
      'bg-violet-700 border-violet-500': completedPercentage >= 40 && completedPercentage < 60,
      'bg-violet-600 border-violet-500': completedPercentage >= 60 && completedPercentage < 80,
      'bg-violet-500 border-violet-400': completedPercentage >= 80,
    })}
    />
  )
}