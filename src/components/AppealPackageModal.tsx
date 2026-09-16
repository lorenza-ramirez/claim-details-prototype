import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import appealAutoAwesome from '../assets/figma/appeal-auto-awesome.svg'
import appealCheckActive from '../assets/figma/appeal-check-active.svg'
import appealCheckCircle from '../assets/figma/appeal-check-circle.svg'
import appealCheckComplete from '../assets/figma/appeal-check-complete.svg'
import appealCircle from '../assets/figma/appeal-circle.svg'
import appealClose from '../assets/figma/appeal-close.svg'
import appealCoverActive from '../assets/figma/appeal-cover-active.svg'
import appealCoverLetter from '../assets/figma/appeal-cover-letter.svg'
import appealFileComplete from '../assets/figma/appeal-file-complete.svg'
import appealFilePresent from '../assets/figma/appeal-file-present.svg'
import appealPayerForm from '../assets/figma/appeal-payer-form.svg'
import appealSend from '../assets/figma/appeal-send.svg'
import { leftPanelClose } from '../assets/icons'
import { AppealCoverLetter } from './AppealCoverLetter'
import { AppealGeneralInformation } from './AppealGeneralInformation'

type AppealSubStep = {
  label: string
  targetId: string
}

type AppealStep = {
  label: string
  icon: string
  completedIcon?: string
  activeIcon?: string
  subSteps?: AppealSubStep[]
}

const APPEAL_STEPS: AppealStep[] = [
  {
    label: '1. General Information',
    icon: appealFilePresent,
    completedIcon: appealFileComplete,
    subSteps: [
      { label: 'Submission', targetId: 'appeal-section-submission' },
      { label: 'Procedures', targetId: 'appeal-section-procedures' },
      { label: 'Documentation', targetId: 'appeal-section-documentation' },
    ],
  },
  {
    label: '2. Cover Letter',
    icon: appealCoverLetter,
    activeIcon: appealCoverActive,
    subSteps: [
      { label: 'Argument', targetId: 'appeal-section-argument' },
      { label: 'Claim and Denial Values', targetId: 'appeal-section-claim-denial' },
      { label: 'From · site defaults', targetId: 'appeal-section-from' },
      { label: 'Request', targetId: 'appeal-section-request' },
    ],
  },
  { label: '3. Payer Form', icon: appealPayerForm },
  { label: '4. Confirm and Submit', icon: appealSend },
]

export function AppealPackageModal({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)
  const [activeSubStep, setActiveSubStep] = useState<string | null>(null)

  useEffect(() => {
    if (!activeSubStep) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(activeSubStep)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeStep, activeSubStep])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="appeal-package" role="presentation">
      <button
        type="button"
        className="appeal-package__backdrop"
        aria-label="Close appeal package"
        onClick={onClose}
      />
      <section
        className="appeal-package__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appeal-package-title"
      >
        <header className="appeal-package__header">
          <h2 id="appeal-package-title" className="appeal-package__title">
            Create an Appeal Package
          </h2>
          <div className="appeal-package__header-actions">
            <span className="appeal-package__ai-badge">
              Athelas AI
              <img src={appealAutoAwesome} alt="" width={14} height={14} />
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              className="appeal-package__close"
              aria-label="Close"
              title="Close"
              onClick={onClose}
            >
              <img src={appealClose} alt="" width={20} height={20} />
            </button>
          </div>
        </header>

        <div className="appeal-package__body">
          <div className="appeal-package__workspace">
            <aside
              className={
                controlsCollapsed
                  ? 'appeal-package__controls appeal-package__controls--collapsed'
                  : 'appeal-package__controls'
              }
              aria-label="Appeal package steps"
            >
              <header className="appeal-package__panel-header">
                {controlsCollapsed ? null : <h3>Controls</h3>}
                <button
                  type="button"
                  className="appeal-package__panel-toggle"
                  aria-expanded={!controlsCollapsed}
                  aria-label={controlsCollapsed ? 'Expand controls' : 'Collapse controls'}
                  title={controlsCollapsed ? 'Expand controls' : 'Collapse controls'}
                  onClick={() => setControlsCollapsed((value) => !value)}
                >
                  <img
                    src={leftPanelClose}
                    alt=""
                    width={controlsCollapsed ? 24 : 18}
                    height={controlsCollapsed ? 24 : 18}
                  />
                </button>
              </header>
              <div className="appeal-package__steps">
                {controlsCollapsed ? null : (
                  <p className="appeal-package__instructions">
                    Complete this steps to submit your appeal
                  </p>
                )}
                <ol>
                  {APPEAL_STEPS.map((step, index) => {
                    const active = index === activeStep
                    const complete = index < activeStep
                    const stepIcon =
                      complete && step.completedIcon
                        ? step.completedIcon
                        : active && step.activeIcon
                          ? step.activeIcon
                          : step.icon
                    const statusIcon = complete
                      ? appealCheckComplete
                      : active
                        ? activeStep === 1
                          ? appealCheckActive
                          : appealCheckCircle
                        : appealCircle

                    return (
                      <li key={step.label}>
                        <button
                          type="button"
                          className={
                            active
                              ? 'appeal-package__step appeal-package__step--active'
                              : 'appeal-package__step'
                          }
                          aria-current={active ? 'step' : undefined}
                          aria-label={step.label}
                          title={step.label}
                          onClick={() => {
                            setActiveStep(index)
                            setActiveSubStep(null)
                          }}
                        >
                          <span className="appeal-package__step-label">
                            <img src={stepIcon} alt="" width={20} height={20} />
                            {controlsCollapsed ? null : <span>{step.label}</span>}
                          </span>
                          {controlsCollapsed ? null : (
                            <img
                              src={statusIcon}
                              alt={complete ? 'Complete' : active ? 'Current step' : 'Incomplete'}
                              width={16}
                              height={16}
                            />
                          )}
                        </button>
                        {!controlsCollapsed && step.subSteps ? (
                          <ol className="appeal-package__substeps">
                            {step.subSteps.map((subStep) => (
                              <li key={subStep.targetId}>
                                <button
                                  type="button"
                                  className={
                                    activeSubStep === subStep.targetId
                                      ? 'appeal-package__substep appeal-package__substep--active'
                                      : 'appeal-package__substep'
                                  }
                                  onClick={() => {
                                    setActiveStep(index)
                                    setActiveSubStep(subStep.targetId)
                                  }}
                                >
                                  {subStep.label}
                                </button>
                              </li>
                            ))}
                          </ol>
                        ) : null}
                      </li>
                    )
                  })}
                </ol>
              </div>
              {controlsCollapsed ? (
                <div className="appeal-package__controls-divider" role="separator" />
              ) : null}
            </aside>

            <section className="appeal-package__builder" aria-label="Appeal package builder">
              <header className="appeal-package__panel-header appeal-package__builder-header">
                <h3>{APPEAL_STEPS[activeStep].label}</h3>
                <button
                  type="button"
                  className="btn btn--primary appeal-package__continue"
                  onClick={() => {
                    setActiveStep((step) => Math.min(step + 1, APPEAL_STEPS.length - 1))
                    setControlsCollapsed(true)
                    setActiveSubStep(null)
                  }}
                >
                  {activeStep === 0 ? 'Continue to Cover Letter' : 'Continue to Payer Form'}
                </button>
              </header>
              <div
                className={
                  activeStep === 1
                    ? 'appeal-package__builder-content appeal-package__builder-content--cover'
                    : 'appeal-package__builder-content'
                }
              >
                {activeStep === 0 ? <AppealGeneralInformation /> : <AppealCoverLetter />}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
