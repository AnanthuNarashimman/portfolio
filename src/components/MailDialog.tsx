import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type RefObject } from 'react'
import { ArrowRight, Check, Loader2, X } from 'lucide-react'
import { profile } from '../data/profile'
import type { MailMeta, MailValues } from '../lib/mail'
import './mail-dialog.css'

/*
 * Pixel mail form in a native <dialog>: used by the hackathon invite and the footer's
 * "Tell me something". Fields are config, sending is a callback (see lib/mail.ts).
 */

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

export type MailField = {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  wide?: boolean // spans both columns
}

function Field({ field, value, onChange }: { field: MailField; value: string; onChange: (name: string, value: string) => void }) {
  const { name, label, type = 'text', placeholder, required, multiline } = field
  const cls =
    'mt-1.5 w-full border-2 border-ink/80 bg-white px-3 py-2 text-[15px] text-ink placeholder:text-ink/35 outline-none focus:border-accent-600 focus:shadow-[3px_3px_0_0_var(--color-accent-300)] dark:border-accent-200/40 dark:bg-[#1e0f0c] dark:text-accent-50 dark:placeholder:text-accent-100/30 dark:focus:border-accent-300'
  return (
    <label className={`block ${field.wide ? 'sm:col-span-2' : ''}`}>
      <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-accent-700 uppercase dark:text-accent-300">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {multiline ? (
        <textarea name={name} rows={4} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(name, e.target.value)} className={`${cls} resize-y`} />
      ) : (
        <input name={name} type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(name, e.target.value)} className={cls} />
      )}
    </label>
  )
}

type Status = { state: 'idle' | 'sending' | 'sent' } | { state: 'error'; message: string }

export default function MailDialog({
  dialogRef,
  id,
  eyebrow,
  title,
  blurb,
  fields,
  initial,
  submitLabel,
  onSend,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>
  id: string
  eyebrow: string
  title: string
  blurb: string
  fields: MailField[]
  initial?: MailValues
  submitLabel: string
  onSend: (values: MailValues, meta: MailMeta) => Promise<void>
}) {
  const blank = () => ({ ...Object.fromEntries(fields.map((f) => [f.name, ''])), ...initial })
  const [form, setForm] = useState<MailValues>(blank)
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [honeypot, setHoneypot] = useState('')
  const startedAt = useRef<number | null>(null) // first keystroke: bots that submit instantly get quietly dropped
  const set = (name: string, value: string) => {
    startedAt.current ??= Date.now()
    setForm((f) => ({ ...f, [name]: value }))
  }
  const close = () => dialogRef.current?.close()

  // After a successful send, closing the dialog clears it for the next message
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    const onClose = () => {
      if (status.state !== 'sent') return
      setForm(blank())
      setHoneypot('')
      startedAt.current = null
      setStatus({ state: 'idle' })
    }
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (status.state === 'sending') return
    setStatus({ state: 'sending' })
    try {
      await onSend(form, { company: honeypot, elapsed: startedAt.current ? Date.now() - startedAt.current : 0 })
      setStatus({ state: 'sent' })
    } catch (err) {
      setStatus({ state: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Please try again.' })
    }
  }

  const sending = status.state === 'sending'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="mail-dialog m-auto w-[min(34rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0"
    >
      <div className="relative">
        <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-2 translate-y-2 bg-accent-900/70" style={px(8)} />
        <form onSubmit={submit} className="pixel-corners relative bg-accent-50 p-6 sm:p-8 dark:bg-[#2c1512]" style={px(8)}>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center text-ink/60 hover:bg-accent-200 hover:text-ink dark:text-accent-100/60 dark:hover:bg-white/10 dark:hover:text-accent-50"
          >
            <X className="size-4" />
          </button>

          {status.state === 'sent' ? (
            // Success: the form gives way to a short confirmation
            <div className="mail-sent py-6 text-center" role="status">
              <span aria-hidden="true" className="pixel-corners mx-auto grid size-14 place-items-center bg-accent-300 text-accent-800" style={px(4)}>
                <Check className="size-7" strokeWidth={3} />
              </span>
              <h3 id={`${id}-title`} className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink dark:text-accent-50">
                Sent. Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}!
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink/70 dark:text-accent-100/75">
                It’s in my inbox. I’ll reply to <span className="font-medium text-ink dark:text-accent-50">{form.email}</span> within a day.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-6 cursor-pointer font-mono text-xs font-bold tracking-[0.16em] text-accent-700 uppercase hover:text-accent-800 dark:text-accent-300"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="font-mono text-xs tracking-[0.25em] text-accent-700 uppercase dark:text-accent-300">{eyebrow}</p>
              <h3 id={`${id}-title`} className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink dark:text-accent-50">
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/70 dark:text-accent-100/75">{blurb}</p>

              <fieldset disabled={sending} className="mt-6 grid gap-4 disabled:opacity-70 sm:grid-cols-2">
                {fields.map((f) => (
                  <Field key={f.name} field={f} value={form[f.name] ?? ''} onChange={set} />
                ))}
              </fieldset>

              {/* Honeypot: invisible to people, irresistible to form-filling bots */}
              <label aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                Company
                <input tabIndex={-1} autoComplete="off" name="company" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="group relative inline-flex cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-300 disabled:cursor-wait"
                >
                  <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/60" />
                  <span className="pixel-corners relative inline-flex items-center gap-2 bg-accent-300 px-5 py-2.5 text-sm font-bold text-accent-800 transition-[translate,background-color] duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:bg-accent-200 group-active:translate-x-1 group-active:translate-y-1 group-disabled:translate-x-0 group-disabled:translate-y-0">
                    {sending ? (
                      <>
                        Sending <Loader2 className="size-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        {submitLabel} <ArrowRight className="size-4" />
                      </>
                    )}
                  </span>
                </button>
                <p className="font-mono text-[11px] text-ink/50 dark:text-accent-100/50">Goes straight to my inbox.</p>
              </div>

              {status.state === 'error' && (
                <p role="alert" className="mt-4 text-sm text-accent-700 dark:text-accent-300">
                  {status.message}{' '}
                  <a href={`mailto:${profile.email}`} className="underline underline-offset-2">
                    Or email me directly.
                  </a>
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </dialog>
  )
}
