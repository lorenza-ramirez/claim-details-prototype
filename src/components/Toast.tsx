import { useEffect } from 'react'
import appealClose from '../assets/figma/appeal-close.svg'

const TOAST_DURATION_MS = 6000

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="icon-btn toast__close"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <img src={appealClose} alt="" width={16} height={16} draggable={false} />
      </button>
    </div>
  )
}
