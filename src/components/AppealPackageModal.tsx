import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import appealArrowBack from '../assets/figma/appeal-arrow-back.svg'
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
import { AppealAiAssistant } from './AppealAiAssistant'
import {
  APPEAL_DELIVERY_ACTION_LABEL,
  AppealConfirmSubmitRedesign,
  type AppealDeliveryMethod,
} from './AppealConfirmSubmitRedesign'
import { AppealCoverLetter } from './AppealCoverLetter'
import { AppealGeneralInformation } from './AppealGeneralInformation'
import { AppealPayerForm } from './AppealPayerForm'

type AppealStep = {
  label: string
  icon: string
  completedIcon?: string
  activeIcon?: string
}

const APPEAL_STEPS: AppealStep[] = [
  {
    label: '1. General Information',
    icon: appealFilePresent,
    completedIcon: appealFileComplete,
  },
  {
    label: '2. Cover Letter',
    icon: appealCoverLetter,
    activeIcon: appealCoverActive,
  },
  { label: '3. Payer Form', icon: appealPayerForm },
  { label: '4. Confirm and Submit', icon: appealSend },
]

export function AppealPackageModal({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<AppealDeliveryMethod>('download')

  function toggleAiPanel() {
    if (!aiOpen) setControlsCollapsed(true)
    setAiOpen((open) => !open)
  }

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
            <button
              type="button"
              className={
                aiOpen
                  ? 'appeal-package__ai-badge appeal-package__ai-badge--active'
                  : 'appeal-package__ai-badge'
              }
              aria-expanded={aiOpen}
              aria-controls="appeal-ai-assistant"
              onClick={toggleAiPanel}
            >
              Athelas AI
              <img src={appealAutoAwesome} alt="" width={14} height={14} />
            </button>
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

        <div className={aiOpen ? 'appeal-package__body appeal-package__body--ai-open' : 'appeal-package__body'}>
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
                        <div
                          className={
                            active
                              ? 'appeal-package__step appeal-package__step--active'
                              : 'appeal-package__step'
                          }
                          aria-current={active ? 'step' : undefined}
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
                        </div>
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
                {activeStep > 0 ? (
                  <button
                    type="button"
                    className="icon-btn appeal-package__back"
                    aria-label="Back"
                    title="Back"
                    onClick={() => {
                      setActiveStep((step) => Math.max(step - 1, 0))
                    }}
                  >
                    <img src={appealArrowBack} alt="" width={20} height={20} />
                  </button>
                ) : null}
                <h3>{activeStep === 3 ? APPEAL_STEPS[2].label : APPEAL_STEPS[activeStep].label}</h3>
                {activeStep < APPEAL_STEPS.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn--primary appeal-package__continue"
                    onClick={() => {
                      setActiveStep((step) => Math.min(step + 1, APPEAL_STEPS.length - 1))
                      setControlsCollapsed(true)
                    }}
                  >
                    {activeStep === 0
                      ? 'Continue to Cover Letter'
                      : activeStep === 1
                        ? 'Continue to Payer Form'
                        : 'Continue to Confirm and Submit'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary appeal-package__continue"
                    onClick={onClose}
                  >
                    {APPEAL_DELIVERY_ACTION_LABEL[deliveryMethod]}
                  </button>
                )}
              </header>
              <div
                className={
                  activeStep === 1
                    ? 'appeal-package__builder-content appeal-package__builder-content--cover'
                    : activeStep === 2
                      ? 'appeal-package__builder-content appeal-package__builder-content--payer'
                      : activeStep === 3
                        ? 'appeal-package__builder-content appeal-package__builder-content--confirm'
                        : 'appeal-package__builder-content'
                }
              >
                {activeStep === 0 ? (
                  <AppealGeneralInformation />
                ) : activeStep === 1 ? (
                  <AppealCoverLetter />
                ) : activeStep === 2 ? (
                  <AppealPayerForm />
                ) : (
                  <AppealConfirmSubmitRedesign
                    method={deliveryMethod}
                    onMethodChange={setDeliveryMethod}
                  />
                )}
              </div>
            </section>
          </div>
          {aiOpen ? (
            <div id="appeal-ai-assistant" className="appeal-package__ai-panel">
              <AppealAiAssistant stepIndex={activeStep} />
            </div>
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  )
}
