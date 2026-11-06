import { useState } from 'react'
import appealAiAvatar1 from '../assets/figma/appeal-ai-avatar-1.svg'
import appealAiAvatar2 from '../assets/figma/appeal-ai-avatar-2.svg'
import appealAiAvatar3 from '../assets/figma/appeal-ai-avatar-3.svg'
import appealAiAvatar4 from '../assets/figma/appeal-ai-avatar-4.svg'
import appealAiMic from '../assets/figma/appeal-ai-mic.svg'
import appealAiSend from '../assets/figma/appeal-ai-send.svg'
import appealAiUpload from '../assets/figma/appeal-ai-upload.svg'
import appealCoverLetter from '../assets/figma/appeal-cover-letter.svg'
import appealEdit from '../assets/figma/appeal-edit.svg'
import appealFilePresent from '../assets/figma/appeal-file-present.svg'
import appealInfo from '../assets/figma/appeal-info.svg'
import appealPayerForm from '../assets/figma/appeal-payer-form.svg'
import appealSend from '../assets/figma/appeal-send.svg'
import argumentAutoAwesome from '../assets/figma/argument-auto-awesome.svg'
import attachFile from '../assets/figma/attach-file.svg'
import checkCircle from '../assets/figma/check-circle.svg'
import docs from '../assets/figma/docs.svg'
import search from '../assets/figma/search.svg'

const QUICK_ACTIONS_BY_STEP = [
  [
    { label: 'Review denials', icon: appealInfo, prompt: 'Summarize the denial types on this submission and what we should argue.' },
    { label: 'Check documentation', icon: docs, prompt: 'Which attached documents best support this appeal?' },
    { label: 'Confirm procedures', icon: appealFilePresent, prompt: 'Confirm the disputed CPTs and amounts we should include.' },
  ],
  [
    { label: 'Strengthen argument', icon: argumentAutoAwesome, prompt: 'Strengthen the cover letter argument using the chart and remit.' },
    { label: 'Cite medical necessity', icon: appealCoverLetter, prompt: 'Draft a tighter medical-necessity paragraph for the disputed services.' },
    { label: 'Rewrite request', icon: appealEdit, prompt: 'Rewrite the request paragraph so the asked-for payment is explicit.' },
  ],
  [
    { label: 'Check field mapping', icon: appealPayerForm, prompt: 'Check the payer form mapping and flag anything that looks off.' },
    { label: 'Explain a field', icon: search, prompt: 'Explain how each mapped payer-form field was derived.' },
    { label: 'Fill remaining fields', icon: attachFile, prompt: 'What still needs to be completed on this payer form?' },
  ],
  [
    { label: 'Review package', icon: checkCircle, prompt: 'Review the appeal package for missing pieces before submit.' },
    { label: 'Check deadline', icon: appealInfo, prompt: 'Confirm we are still inside the appeal filing window.' },
    { label: 'Prepare to submit', icon: appealSend, prompt: 'Walk me through what happens when I confirm and submit.' },
  ],
] as const

function AppealAiAvatar() {
  return (
    <div className="appeal-ai__avatar" aria-hidden>
      <span className="appeal-ai__avatar-piece appeal-ai__avatar-piece--1">
        <img src={appealAiAvatar1} alt="" />
      </span>
      <span className="appeal-ai__avatar-piece appeal-ai__avatar-piece--2">
        <img src={appealAiAvatar2} alt="" />
      </span>
      <span className="appeal-ai__avatar-piece appeal-ai__avatar-piece--3">
        <img src={appealAiAvatar3} alt="" />
      </span>
      <span className="appeal-ai__avatar-piece appeal-ai__avatar-piece--4">
        <img src={appealAiAvatar4} alt="" />
      </span>
    </div>
  )
}

export function AppealAiAssistant({ stepIndex = 0 }: { stepIndex?: number }) {
  const [message, setMessage] = useState('')
  const quickActions = QUICK_ACTIONS_BY_STEP[stepIndex] ?? QUICK_ACTIONS_BY_STEP[0]

  function selectPrompt(prompt: string) {
    setMessage(prompt)
  }

  return (
    <aside className="appeal-ai" aria-label="Athelas AI assistant">
      <div className="appeal-ai__welcome">
        <AppealAiAvatar />
        <div className="appeal-ai__greeting">
          <h3>Good Morning Jane</h3>
          <p>How can I help you today?</p>
        </div>
        <div className="appeal-ai__quick-actions" aria-label="Suggested prompts">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => selectPrompt(action.prompt)}
            >
              <img src={action.icon} alt="" width={14} height={14} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <footer className="appeal-ai__footer">
        <button
          type="button"
          className="appeal-ai__teach"
          onClick={() => selectPrompt('Teach me about this page')}
        >
          Teach me about this page
        </button>
        <div className="appeal-ai__composer">
          <label className="visually-hidden" htmlFor="appeal-ai-message">
            Ask Athelas AI
          </label>
          <textarea
            id="appeal-ai-message"
            value={message}
            placeholder="Ask anything..."
            onChange={(event) => setMessage(event.target.value)}
          />
          <span className="appeal-ai__composer-actions">
            <button type="button" aria-label="Upload a file" title="Upload a file">
              <img src={appealAiUpload} alt="" width={20} height={20} />
            </button>
            <span>
              <button type="button" aria-label="Use microphone" title="Use microphone">
                <img src={appealAiMic} alt="" width={20} height={20} />
              </button>
              <button
                type="button"
                className="appeal-ai__send"
                aria-label="Send message"
                title="Send"
              >
                <img src={appealAiSend} alt="" width={20} height={20} />
              </button>
            </span>
          </span>
        </div>
      </footer>
    </aside>
  )
}
