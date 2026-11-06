import type { KeyboardEvent, PointerEvent } from 'react'

/** Left-edge drag handle for a right-docked column; dragging left widens it. */
export function ResizeHandle({
  width,
  min,
  max,
  label,
  onWidthChange,
  onReset,
  onResizingChange,
}: {
  /** Current width; when omitted the rendered width of the parent is used. */
  width?: number
  min: number
  /** Upper bound, or a function evaluated against the parent's container width. */
  max: number | ((containerWidth: number) => number)
  label: string
  onWidthChange: (width: number) => void
  onReset?: () => void
  onResizingChange?: (resizing: boolean) => void
}) {
  function bounds(handle: HTMLElement) {
    const column = handle.parentElement
    const containerWidth = column?.parentElement?.clientWidth ?? window.innerWidth
    const upper = typeof max === 'function' ? max(containerWidth) : max
    return { upper: Math.max(min, upper), current: width ?? column?.offsetWidth ?? min }
  }

  function clamp(value: number, upper: number) {
    return Math.min(upper, Math.max(min, Math.round(value)))
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const handle = event.currentTarget
    const { upper, current } = bounds(handle)
    const startX = event.clientX
    handle.setPointerCapture(event.pointerId)
    onResizingChange?.(true)

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      onWidthChange(clamp(current + (startX - moveEvent.clientX), upper))
    }
    const onUp = () => {
      onResizingChange?.(false)
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const { upper, current } = bounds(event.currentTarget)
    const step = event.shiftKey ? 64 : 16
    if (event.key === 'ArrowLeft') onWidthChange(clamp(current + step, upper))
    else if (event.key === 'ArrowRight') onWidthChange(clamp(current - step, upper))
    else if (event.key === 'Home') onWidthChange(min)
    else if (event.key === 'End') onWidthChange(upper)
    else return
    event.preventDefault()
  }

  return (
    <div
      className="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={typeof max === 'number' ? max : undefined}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={onReset}
    />
  )
}
