import { useRef, useEffect, useState, useCallback } from 'react'

/**
 * useScrollReveal — Intersection Observer hook for scroll-triggered animations.
 * Returns { ref, isVisible } — attach ref to element, use isVisible for className toggling.
 *
 * @param {Object} options
 * @param {number} options.threshold - 0 to 1, how much element must be visible (default 0.15)
 * @param {string} options.rootMargin - margin around root (default '0px 0px -60px 0px')
 * @param {boolean} options.once - if true, stays visible after first intersection (default true)
 */
export function useScrollReveal({ threshold = 0.08, rootMargin = '50px 0px 50px 0px', once = true } = {}) {
  const [node, setNode] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const ref = useCallback((el) => {
    if (el) setNode(el)
  }, [])

  useEffect(() => {
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(node)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)

    // Safety fallback: ensure element becomes visible after short duration
    const fallback = setTimeout(() => {
      setIsVisible(true)
    }, 1200)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [node, threshold, rootMargin, once])

  return { ref, isVisible }
}

/**
 * useStaggerChildren — Returns an array of refs + visibility states for staggering child animations.
 * Each child gets a delay based on its index.
 * Uses callback ref to reliably attach to elements mounted asynchronously.
 *
 * @param {number} count - number of children to track
 * @param {number} staggerMs - delay between each child in ms (default 60)
 */
export function useStaggerChildren(count, staggerMs = 60) {
  const [node, setNode] = useState(null)
  const [visibleChildren, setVisibleChildren] = useState(() => new Set())

  const parentRef = useCallback((el) => {
    if (el) setNode(el)
  }, [])

  useEffect(() => {
    if (!node) return

    let isSubscribed = true
    const timers = []

    const revealAll = () => {
      if (!isSubscribed) return
      for (let i = 0; i < count; i++) {
        const timer = setTimeout(() => {
          if (isSubscribed) {
            setVisibleChildren(prev => new Set([...prev, i]))
          }
        }, i * staggerMs)
        timers.push(timer)
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      revealAll()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealAll()
          observer.unobserve(node)
        }
      },
      { threshold: 0.05, rootMargin: '50px 0px 50px 0px' }
    )

    observer.observe(node)

    // Safety fallback: reveal all after 800ms so nothing ever stays hidden
    const safetyTimer = setTimeout(() => {
      if (isSubscribed) {
        setVisibleChildren(new Set(Array.from({ length: count }, (_, i) => i)))
      }
    }, 800)
    timers.push(safetyTimer)

    return () => {
      isSubscribed = false
      observer.disconnect()
      timers.forEach(t => clearTimeout(t))
    }
  }, [node, count, staggerMs])

  const isChildVisible = useCallback((index) => {
    return visibleChildren.has(index)
  }, [visibleChildren])

  return { parentRef, isChildVisible }
}

/**
 * useParallax — lightweight parallax effect on scroll for background elements.
 * Returns { ref, offset } — offset is a number you can use for translateY.
 *
 * @param {number} speed - parallax speed factor (default 0.15, negative = opposite direction)
 */
export function useParallax(speed = 0.15) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Find the scrollable parent (main element)
    const scrollParent = el.closest('main') || window

    const handleScroll = () => {
      const scrollTop = scrollParent === window ? window.scrollY : scrollParent.scrollTop
      const rect = el.getBoundingClientRect()
      const parentRect = scrollParent === window
        ? { top: 0, height: window.innerHeight }
        : scrollParent.getBoundingClientRect()

      // Calculate offset based on element position relative to viewport center
      const centerOffset = rect.top - parentRect.top - parentRect.height / 2
      setOffset(centerOffset * speed)
    }

    scrollParent.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => scrollParent.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { ref, offset }
}

/**
 * useCountUp — Animates a number counting up when element becomes visible.
 *
 * @param {number} target - the target number
 * @param {number} durationMs - animation duration in ms (default 1200)
 */
export function useCountUp(target, durationMs = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.unobserve(el)

          const start = performance.now()
          const animate = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / durationMs, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(target)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [target, durationMs])

  return { ref, count }
}
