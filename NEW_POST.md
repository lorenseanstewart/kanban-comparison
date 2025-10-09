---
title: "React-by-Default, Tested: Same App, Seven Builds, 3x Smaller Bundles"
date: "2025-10-16"
description: "Building the same Kanban app in 7 frameworks reveals 3x bundle differences and why mobile performance demands better defaults."
excerpt: "React-by-default has costs. We measured them."
tags: ["React", "Vue", "Svelte", "Solid", "Qwik", "Angular", "Frontend"]
---

# React-by-Default, Tested: Same App, Seven Builds, 3x Smaller Bundles

Last month, I argued that React-by-default is killing frontend innovation by prioritizing network effects over technical merit. Commenters called it exaggeration without data. Challenge accepted: I built the same Kanban app across seven frameworks to measure the real costs.

I'm a firm believer in choosing the best tool for the job. That means understanding your product's constraints and the available options. For my team, we're building tools for real estate agents that work seamlessly on desktops *and* in the field (think open houses, parking lots, or spotty cellular signals). No native apps means web performance is everything. More broadly, this should be the default mindset: Engineer apps that load quickly on mobile devices, even away from WiFi. When someone pulls up your app in a grocery store line or while waiting in their car, every second counts. Slow loads damage your brand.

The difference? Thoughtful engineering versus blind implementation. Choose poorly early on, and you're locked into bloated tech that struggles on mobile. Let's see how Next.js (standard and with React Compiler), Nuxt, Analog (Angular), SolidStart, SvelteKit, and Qwik City compare. Spoiler: Bundle sizes varied by 3x, with massive implications for cellular users.