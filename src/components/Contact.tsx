import { useState } from 'react'
import Reveal from './Reveal'
import { PROFILE } from '../data/site'

export default function Contact() {
  const hasEmail = Boolean(PROFILE.email)
  const [copied, setCopied] = useState(false)
  const copyEmail = () => {
    if (!PROFILE.email) return
    navigator.clipboard?.writeText(PROFILE.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <>
      <section className="contact" id="contact" aria-label="Contact">
        <Reveal as="p" className="eyebrow">Contact</Reveal>
        <Reveal as="p" className="status" delay={0.04}>
          <span className="status__dot" aria-hidden="true" />Available for new projects
        </Reveal>
        <Reveal as="h2" className="contact__title" delay={0.08}>
          Have an idea?<br /><em>Let&rsquo;s build it.</em>
        </Reveal>
        <Reveal as="p" className="contact__text" delay={0.15}>
          Whether it&rsquo;s a portfolio, business website, AI-powered application or custom
          digital product — let&rsquo;s create something worth remembering.
        </Reveal>
        <Reveal className="hero__ctas contact__ctas" delay={0.22}>
          {hasEmail ? (
            <>
              <a className="btn btn--primary" href={`mailto:${PROFILE.email}`}>Start a Project</a>
              <button className="btn btn--ghost" onClick={copyEmail} data-cursor="COPY">Copy email</button>
            </>
          ) : (
            <span className="btn btn--primary is-disabled" title="Add your email in src/data/site.ts">Start a Project</span>
          )}
          {!hasEmail && <a className="btn btn--ghost" href="#top">Let&rsquo;s Connect</a>}
        </Reveal>
        {!hasEmail && (
          <Reveal as="p" className="contact__pending" delay={0.28}>
            Contact editing: add your email in <code>src/data/site.ts</code> to activate the button.
          </Reveal>
        )}
      </section>

      <section className="final" aria-label="Final call to action">
        <Reveal as="h2" className="final__title">
          Your next website could look like this.
        </Reveal>
        <Reveal delay={0.12}>
          <a className="final__link" href="#top" data-cursor="OPEN →">
            Let&rsquo;s make it happen <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </section>
      <div className={`toast${copied ? ' is-shown' : ''}`} role="status" aria-live="polite">
        Email copied to clipboard
      </div>
    </>
  )
}
