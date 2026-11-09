import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const controlClass =
  'w-full rounded-r2 border border-line3 bg-surface p-3 text-t16 text-fg outline-0 transition-[border-color,box-shadow] duration-fast ease-out-mk focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_22%,transparent)] aria-invalid:border-spark'

type FieldShellProps = {
  id: string
  label: string
  optional?: boolean
  /** Мітка праворуч від підпису, px-11 (наприклад, +380). */
  prefix?: string
  hint?: ReactNode
  error?: string
  children: ReactNode
  counter?: ReactNode
}

function FieldShell({ id, label, optional, prefix, hint, error, counter, children }: FieldShellProps) {
  return (
    <div className="grid w-full gap-[6px]">
      <label htmlFor={id} className="flex justify-between text-t13 text-muted">
        {label}
        {optional && <span>необов'язково</span>}
        {prefix && <span className="font-px text-px11 uppercase">{prefix}</span>}
      </label>
      {children}
      {(hint || counter) && !error && (
        <div id={`${id}-hint`} className="flex justify-between gap-space-3 text-t13 text-muted">
          <span>{hint}</span>
          {counter}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-t13 text-spark">
          {error}
        </p>
      )}
    </div>
  )
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'prefix'> & {
  label: string
  optional?: boolean
  /** Мітка праворуч від підпису, px-11 (наприклад, +380). */
  prefix?: string
  hint?: ReactNode
  error?: string
}

export function Field({ label, optional, prefix, hint, error, className, ...props }: FieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} optional={optional} prefix={prefix} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClass, className)}
        {...props}
      />
    </FieldShell>
  )
}

const MAX_LENGTH = 240
const NEAR_LENGTH = 200

type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'maxLength'> & {
  label: string
  optional?: boolean
  hint?: ReactNode
  error?: string
  value: string
}

/** Текстове поле росте з текстом, ліміт 240 знаків, лічильник px-11. */
export function TextareaField({
  label,
  optional,
  hint,
  error,
  value,
  className,
  onInput,
  ...props
}: TextareaFieldProps) {
  const id = useId()
  const length = value.length

  return (
    <FieldShell
      id={id}
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      counter={
        <span
          className={cn(
            'font-px text-px11 uppercase tabular-nums text-muted',
            length >= NEAR_LENGTH && 'text-fg',
            length >= MAX_LENGTH && 'text-spark',
          )}
        >
          {length} / {MAX_LENGTH}
        </span>
      }
    >
      <textarea
        id={id}
        value={value}
        maxLength={MAX_LENGTH}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClass, 'min-h-24 resize-none overflow-hidden leading-normal', className)}
        onInput={(event) => {
          const el = event.currentTarget
          el.style.height = 'auto'
          el.style.height = `${el.scrollHeight}px`
          onInput?.(event)
        }}
        {...props}
      />
    </FieldShell>
  )
}
