# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Existing: Next.js 16 (App Router), React 19, Tailwind 4, framer-motion, a contact API route backed by Supabase and Resend, deployed on Vercel at crookscodes.com. Adding Three.js as one npm dependency for the 3D scene (confirmed by Jeremy on 2026-11-04). No new languages or frameworks beyond that.

## Users
Primary: hiring managers and recruiters screening candidates for cyber security co-op placements and junior security/developer roles, mostly Halifax and Canada, often arriving from a resume link or LinkedIn with a few minutes to decide whether to shortlist. Their job: confirm Jeremy can actually build and ship, see evidence, and find a way to reach him.
Secondary (not the focus of this surface): small-business owners who find him through Dory Digital.

## Product Purpose
A single-page portfolio for Jeremy Crooks (CrooksCodes). Its job is to land a cyber security co-op or job. Success is a hiring manager shortlisting him or sending a message through the contact form or email.

## Positioning
A first-year computer science student who already ships complete products end to end: four full-stack apps (three live), a co-founded Halifax web business, and a developer job maintaining a community organization's site and internal tools. The claim a peer could not truthfully copy: real shipped software plus a security direction, not coursework alone.

## Operating Context
Halifax, Nova Scotia. Bachelor of Computer Science at Dalhousie University, Sep 2026 to 2030 (year 1 of 4). Matrix Code program (One North End x Dalhousie, 2024 to 2026). Co-founder and web developer at Dory Digital (Jun 2026 to present). Web developer at One North End (May 2026 to present). Co-op hiring runs on university term cycles.

## Capabilities and Constraints
- One route (`/`) with in-page sections; contact form posts to `/api/contact` (validated, rate limited, stored in Supabase, emailed via Resend). Keep this working.
- Existing metadata, Open Graph and Twitter images, icon, sitemap-level SEO in `app/layout.tsx` stay.
- Must not read as AI-generated, template, corporate, or salesy. Must not be plain or quiet either.
- One 3D object that transforms as the visitor scrolls: a clay door modelled in Blender (`blender/build_door.py` exports `public/models/door.glb`) and rendered with Three.js.
- Reference for quality bar only, explicitly not to copy: https://www.ibrahimaltawil.com/ (Three.js clay morph, light paper palette, Switzer + Fragment Mono).
- Undecided: no security-specific projects or certifications exist yet; do not invent any.

## Brand Commitments
- Name: CrooksCodes (crookscodes.com). Person: Jeremy Crooks.
- Email jeremy@crookscodes.com, GitHub @CrooksJeremy, LinkedIn jeremygcrooks.
- Voice: direct, specific, a little wry. No buzzwords, no invented stats.
- Previous dark ground + gold accent identity is released; palette is open (confirmed 2026-11-04).

## Evidence on Hand
- Projects: Table4Two (https://table4two-crookscodes.vercel.app), Truecast (https://truecast-crookscodes.vercel.app), Streetwear Storefront (https://streetwear-crookscodes.vercel.app), Proving Ground (in progress, no link). Descriptions and tech stacks in `app/page.tsx`.
- Experience and education entries in `app/page.tsx`.
- No project screenshots in the repo; the three live URLs can be captured.
- No testimonials, metrics, certifications, or security writeups. Do not fabricate.

## Product Principles
1. Evidence over claims: every section shows something Jeremy made or did.
2. One visitor, one decision: a hiring manager should know within seconds who this is, what he has shipped, and how to reach him.
3. Specific beats polished: concrete names, dates, and stacks over adjectives.
4. Craft is the proof: the site itself is a sample of his work, so it must be fast, accessible, and clearly hand-built.

## Accessibility & Inclusion
Respect prefers-reduced-motion (static fallback for the 3D scene), keyboard-navigable, WCAG AA contrast.
