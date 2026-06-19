'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const RAINDATE_REGEX = /\b(raindate)\b/gi

function shouldSkipElement (el: Element | null): boolean {
	if (!el) {
		return true
	}
	const skipTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'HEAD', 'TITLE', 'SVG', 'NOSCRIPT', 'OPTION'])
	let cur: Element | null = el
	// Skip if inside disallowed containers or already wrapped
	while (cur) {
		if (cur instanceof HTMLElement && cur.dataset.brand === 'raindate') {
			return true
		}
		if (skipTags.has(cur.tagName)) {
			return true
		}
		cur = cur.parentElement
	}
	return false
}

function wrapMatchesInTextNode (textNode: Text): void {
	const parent = textNode.parentElement
	if (!parent || shouldSkipElement(parent)) {
		return
	}
	const text = textNode.nodeValue
	if (text === null || text.length === 0) {
		return
	}
	if (!RAINDATE_REGEX.test(text)) {
		RAINDATE_REGEX.lastIndex = 0
		return
	}
	RAINDATE_REGEX.lastIndex = 0

	const frag = document.createDocumentFragment()
	let lastIndex = 0
	let match: RegExpExecArray | null
	while ((match = RAINDATE_REGEX.exec(text)) !== null) {
		const { index } = match
		if (index > lastIndex) {
			frag.appendChild(document.createTextNode(text.slice(lastIndex, index)))
		}
		const span = document.createElement('span')
		span.className = 'text-yellow-500 font-semibold'
		span.textContent = 'RainDate'
		span.setAttribute('data-brand', 'raindate')
		frag.appendChild(span)
		lastIndex = index + match[0].length
	}
	if (lastIndex < text.length) {
		frag.appendChild(document.createTextNode(text.slice(lastIndex)))
	}
	parent.replaceChild(frag, textNode)
}

function highlightAll (): void {
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
	const toProcess: Text[] = []
	let node: Node | null = walker.nextNode()
	while (node) {
		if (node.nodeType === Node.TEXT_NODE) {
			const parent = (node as Text).parentElement
			if (parent && !shouldSkipElement(parent)) {
				const value = (node as Text).nodeValue
				if (value !== null && value.length > 0 && RAINDATE_REGEX.test(value)) {
					toProcess.push(node as Text)
				}
				RAINDATE_REGEX.lastIndex = 0
			}
		}
		node = walker.nextNode()
	}
	for (const t of toProcess) {
		wrapMatchesInTextNode(t)
	}
}

export default function BrandHighlighter (): null {
	const pathname = usePathname()

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}
		let scheduled = false
		const schedule = () => {
			if (scheduled) {
				return
			}
			scheduled = true
			window.requestAnimationFrame(() => {
				scheduled = false
				highlightAll()
			})
		}

		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === 'childList' || m.type === 'characterData') {
					schedule()
					break
				}
			}
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true
		})

		highlightAll()

		return () => {
			observer.disconnect()
		}
	}, [pathname])

	return null
}
