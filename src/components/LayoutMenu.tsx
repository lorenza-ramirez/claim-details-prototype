import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { layoutColumns } from '../assets/icons'

type MenuItem = {
  id: string
  label: string
  disabled?: boolean
  /** Renders as a toggle (`menuitemcheckbox`) when set. */
  checked?: boolean
  onSelect: () => void
}

export function LayoutMenu({
  label,
  customized,
  highlight,
  resetLabel,
  resetDisabled,
  useForAll,
  resetAllDisabled,
  onReset,
  onToggleUseForAll,
  onResetAll,
}: {
  label: string
  customized: boolean
  /** Briefly emphasizes the button after the layout changed on its own. */
  highlight: boolean
  resetLabel: string
  resetDisabled: boolean
  useForAll: boolean
  resetAllDisabled: boolean
  onReset: () => void
  onToggleUseForAll: () => void
  onResetAll: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const items: MenuItem[] = [
    { id: 'reset', label: resetLabel, disabled: resetDisabled, onSelect: onReset },
    {
      id: 'all',
      label: 'Use this layout for all claims',
      checked: useForAll,
      onSelect: onToggleUseForAll,
    },
    {
      id: 'reset-all',
      label: 'Reset all layouts',
      disabled: resetAllDisabled,
      onSelect: onResetAll,
    },
  ]

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  function focusItem(index: number) {
    const count = items.length
    itemRefs.current[(index + count) % count]?.focus()
  }

  function openMenu(focusIndex: number) {
    setOpen(true)
    window.requestAnimationFrame(() => focusItem(focusIndex))
  }

  function closeMenu(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') openMenu(0)
    else if (event.key === 'ArrowUp') openMenu(items.length - 1)
    else return
    event.preventDefault()
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const index = itemRefs.current.findIndex((item) => item === document.activeElement)
    if (event.key === 'ArrowDown') focusItem(index + 1)
    else if (event.key === 'ArrowUp') focusItem(index - 1)
    else if (event.key === 'Home') focusItem(0)
    else if (event.key === 'End') focusItem(items.length - 1)
    else if (event.key === 'Escape') closeMenu(true)
    else if (event.key === 'Tab') {
      setOpen(false)
      return
    } else return
    event.preventDefault()
    event.stopPropagation()
  }

  function select(item: MenuItem) {
    if (item.disabled) return
    item.onSelect()
    if (item.checked === undefined) closeMenu(true)
  }

  const triggerClass = ['layout-menu__trigger']
  if (highlight) triggerClass.push('layout-menu__trigger--highlight')

  return (
    <div className="layout-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass.join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? closeMenu(false) : openMenu(0))}
        onKeyDown={handleTriggerKeyDown}
      >
        <img src={layoutColumns} alt="" width={18} height={18} draggable={false} />
        <span className="layout-menu__label">
          Layout: <strong>{label}</strong>
        </span>
        {customized ? <span className="layout-menu__tag">Customized</span> : null}
      </button>
      {open ? (
        <div
          id={menuId}
          className="layout-menu__menu"
          role="menu"
          aria-label="Layout options"
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <div key={item.id} role="none">
              {index === items.length - 1 ? (
                <div className="layout-menu__separator" role="separator" />
              ) : null}
              <button
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                aria-checked={item.checked}
                aria-disabled={item.disabled || undefined}
                tabIndex={-1}
                className="layout-menu__item"
                onClick={() => select(item)}
              >
                <span>{item.label}</span>
                {item.checked === undefined ? null : (
                  <span
                    className={
                      item.checked
                        ? 'layout-menu__switch layout-menu__switch--on'
                        : 'layout-menu__switch'
                    }
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
