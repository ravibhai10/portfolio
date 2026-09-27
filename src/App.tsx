import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import About from './components/About'
import Marquee from './components/Marquee'
import Work from './components/Work'
import ApexDeepDive from './components/ApexDeepDive'
import Skills from './components/Skills'
import Journey from './components/Journey'
import Services from './components/Services'
import Social from './components/Social'
import Contact from './components/Contact'
import Footer from './components/Footer'
import TurntableHero from './components/hero/TurntableHero'
import Effects from './components/Effects'
import { setLenis } from './lib/interactions'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const failsafe = useRef(0)

  // Single smooth-scroll system: Lenis drives GSAP's ticker; ScrollTrigger
  // syncs off Lenis. Skipped entirely under reduced-motion (native scroll).
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({ duration: 1.1 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Reveal the page once frames are ready; never trap the user behind the
  // loader if an asset hangs.
  useEffect(() => {
    failsafe.current = window.setTimeout(() => setReady(true), 8000)
    return () => clearTimeout(failsafe.current)
  }, [])

  // Playful re-engagement: nudge the tab title when the user looks away.
  useEffect(() => {
    const original = document.title
    const onVis = () => {
      document.title = document.hidden ? '👋 come back!' : original
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      document.title = original
    }
  }, [])

  return (
    <div id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <Loader progress={progress} done={ready} />
      <Cursor />
      <Effects />
      <Navbar />
      <main id="main">
        <TurntableHero onProgress={setProgress} onReady={() => setReady(true)} />
        <About />
        <Marquee />
        <Work />
        <ApexDeepDive />
        <Skills />
        <Journey />
        <Services />
        <Social />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

