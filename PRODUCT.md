# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences:
- **Customers**: people booking laundry/dry-clean pickup and delivery from their phone, usually quickly between other tasks. They need to see what services cost and place an order with minimal friction.
- **Laundry business admin/staff**: the operator(s) who run the business day-to-day — managing the service catalog (sections, items, per-service pricing), placing orders on behalf of walk-in/phone customers, tracking orders, and reviewing customer/analytics data. Likely used on both desktop (back office) and mobile (on the floor).

## Product Purpose

SaiLaundryPlus is a laundry pickup-and-delivery PWA (React + Vite + Firebase). Customers browse services and pricing, save pickup locations, and place orders; admins manage the catalog of services/pricing, process orders, and view customers and analytics.

## Positioning

A direct-to-operator laundry ordering app: the same product that shows customers a live, accurate price list is what the business uses to maintain that price list, so pricing is always a single source of truth instead of a printed rate card.

## Operating Context

- Catalog data model: sections (e.g. Men, Women, Kids, Household) → items (e.g. Shirt, Saree) → services (e.g. "Wash & Iron", price in ₹). Stored in Firestore, editable only by admins.
- Admin catalog page (`/admin/catalog`, [AdminCatalogPage.jsx](src/pages/admin/AdminCatalogPage.jsx)) is a CRUD surface: add/rename/delete sections, add/remove items within a section, add/remove/edit services (type + ₹ price) within an item, expand/collapse sections. Currently an inline-edit form list — functional but visually generic.
- Customer catalog page (`/catalog`, [CatalogPage.jsx](src/pages/CatalogPage.jsx)) is read-only: browse sections/items/services and prices. It intentionally stays a browse/reference page, not a shopping cart — ordering happens separately on the "New Order" page ([PlaceOrderPage.jsx](src/pages/PlaceOrderPage.jsx)), which is out of scope for this redesign.
- Both pages currently sit inside the app's existing shared visual language (see Brand Commitments) via [MainLayout.jsx](src/layouts/MainLayout.jsx) (customer) and [AdminLayout.jsx](src/layouts/AdminLayout.jsx) (admin), both supporting light/dark mode.

## Capabilities and Constraints

- Firestore is the backing store; catalog reads have a hardcoded in-code fallback dataset used if Firestore is empty/unreachable.
- Admin catalog editing is optimistic client-side state with an explicit per-section Save action (no autosave).
- Must preserve existing functionality/behavior of both pages (add/edit/delete section, item, service; expand/collapse; search is not currently implemented on either page).
- Tailwind CSS with `darkMode: 'class'`; must support both light and dark themes.

## Brand Commitments

Established, coherent visual language already in use across the whole app (login, orders, profile, admin dashboard, etc.) — this is inherited, not reinvented, for the catalog redesign:
- Indigo/blue as the primary brand color (`from-blue-600 to-indigo-600` gradients for primary actions, indigo-600/400 for accents and links).
- "Glassmorphism" cards: translucent white/gray backgrounds (`bg-opacity-60`), `backdrop-blur-xl`, soft `shadow-lg`, large rounded corners (`rounded-2xl`/`rounded-3xl`).
- `Plus Jakarta Sans` for headings (`font-heading`), system sans for body text.
- `lucide-react` icon set throughout.
- `react-hot-toast` for feedback/confirmation messaging.

## Evidence on Hand

- Live catalog content is real business data (garment categories, services like Wash & Fold/Wash & Iron/Dry Clean, real ₹ prices) — no placeholder/fabricated content needed.
- No formal brand guide beyond the code itself; DESIGN.md not yet documented (existing system taken as authority per code).

## Product Principles

1. Pricing is operational truth — the admin editing experience must make it fast and error-proof to keep prices accurate, since customers see exactly what admins save.
2. One visual language across customer and admin surfaces — a customer and an admin should recognize it as the same product.
3. Customer catalog stays a fast, scannable reference, not a checkout flow — ordering is deliberately a separate task.
4. Mobile-first: both audiences primarily use this on a phone.
