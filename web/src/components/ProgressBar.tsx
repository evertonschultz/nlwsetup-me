import * as Progress from '@radix-ui/react-progress';

interface ProgressBarProps {
  progress: number
}

export function ProrgressBar(props: ProgressBarProps) {
  const progressStyles = {
    width: `${props.progress}%`
  }

  return (
    <Progress.Root
      aria-valuenow={props.progress}
      aria-label="Progresso de hábitos completados"
      value={props.progress}
      className="h-3 rounded-xl bg-zinc-700 w-full mt-4"
    >
      <Progress.Indicator
        className="h-3 rounded-xl bg-violet-600 transition-all"
        style={{ width: progressStyles.width }}
      />
    </Progress.Root>
  )
}