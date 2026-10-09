# Product Requirements Document (PRD)

## Project: Testimonial SaaS — Minimal Version

**Version:** 1.0
**Status:** Initial specification
**Product type:** Multi-user SaaS web application

## 1. Product Overview

The application allows businesses, creators, and individuals to collect, manage, organize, and display customer testimonials through shareable collection pages and embeddable widgets.

Each registered user can create testimonial collection spaces, customize their collection forms, collect testimonials without requiring customers to register, manage submitted testimonials, and display approved testimonials on external websites.

The application uses a freemium subscription model with Free and Pro plans.

## 2. Goals

* Allow users to register, log in, and manage their own testimonial spaces.
* Let users customize collection forms, required fields, themes, and ratings.
* Allow customers to submit testimonials using a public link without an account.
* Provide an inbox for managing, featuring, hiding, and deleting testimonials.
* Display testimonial collection statistics on the dashboard.
* Generate configurable testimonial widgets and embeddable JavaScript code.
* Support Free and Pro subscription plans.
* Integrate Stripe Checkout and webhooks for subscription management.

## 3. User Roles

### 3.1 Space Owner

A registered user who can create and manage spaces, configure forms, view statistics, manage testimonials, customize widgets, and manage their subscription.

### 3.2 Testimonial Submitter

A customer who visits a public collection link and submits a testimonial without registering or logging in.

### 3.3 System

The backend that manages authentication, data isolation, subscription limits, testimonial submissions, widget rendering, and payment events.

## 4. Functional Requirements

### FR-01: Authentication

* Users can register with their name, email address, and password.
* Users can log in and log out.
* Passwords must be securely hashed.
* Private dashboard pages must require authentication.
* Users must only access their own spaces and testimonials.
* Include appropriate validation and error messages.

### FR-02: Dashboard

Display:

* Total spaces.
* Total testimonials collected.
* Total featured testimonials.
* Recent testimonial activity.
* A time-series chart showing testimonials collected by day.
* Date-range filters, such as 7 days, 30 days, and 90 days.
* A Free-plan upgrade banner when applicable.

Statistics must be calculated from actual application data.

### FR-03: Space Management

* Create, view, edit, and delete spaces.
* Each space must have a title and subtitle/description.
* Generate a unique public URL or slug for each space.
* Allow the owner to configure collection fields.
* Allow the owner to select whether star ratings are enabled.
* Display the public URL after successful creation.
* Enforce subscription limits before creating spaces.

### FR-04: Collection Form Configuration

Required default fields:

* Customer name.
* Email address.

Additional predefined fields:

* Company name.
* Job title.
* Social profile URL.
* Profile photo.

For each optional field:

* Enable or disable the field.
* Mark the field as required or optional when enabled.

Other configuration:

* Space title and subtitle.
* Rating enabled or disabled.
* One of 25 predefined visual themes.

The public form must display only the fields enabled by the space owner.

### FR-05: Public Testimonial Submission

* Anyone with the public link can submit a testimonial without an account.
* Display the space title and subtitle.
* Show all enabled collection fields.
* Validate required fields on the client and server.
* Allow a testimonial text submission.
* Display a star rating only when enabled for that space.
* Ask for consent to share the testimonial publicly or on social networks.
* Record consent separately from the testimonial text.
* Save the submission against the correct space.
* Show a friendly confirmation page after successful submission.
* Do not expose private owner information or other customers' submissions.

Suggested confirmation message: "Your kind words are officially out in the world. Thanks for making someone's day!"

### FR-06: Testimonial Inbox

* List testimonials belonging to the authenticated owner.
* Display submitter name, email, testimonial text, rating, submission date, and status.
* Filter by space, status, rating, and date.
* Search testimonial text and submitter name.
* Feature or unfeature a testimonial.
* Mark a testimonial as a favorite.
* Hide or unhide a testimonial from public display.
* Delete a testimonial after confirmation.
* Provide an overflow menu for secondary actions.
* Keep featured testimonials first in public displays, followed by the configured ordering.

### FR-07: Public Testimonial Display

* A space can have a public collection page.
* Public pages must show only testimonials eligible for public display.
* Hidden and deleted testimonials must never appear publicly.
* Featured testimonials should appear first.
* Respect the submitter's sharing consent.
* Do not expose submitter email addresses publicly.
* Respect the space's rating configuration.

### FR-08: Widget Builder

* Allow the owner to choose a space.
* Support at least two layout styles: Masonry and Carousel.
* Provide a live preview.
* Offer light and dark modes.
* Allow background-color customization.
* Offer a small set of animation options, including none.
* Generate embeddable JavaScript code.
* Provide a copy-code action.
* Display instructions for adding the widget to an external website.
* Render only testimonials eligible for public display.
* Ensure the embedded widget works independently of the owner's authenticated session.

### FR-09: Subscription Plans

**Free plan**

* Maximum 3 spaces per account.
* Maximum 100 testimonials per space.
* Core collection and testimonial-management features.
* Basic widget customization.

**Pro plan**

* Price: $19.99 per month, subject to confirmation.
* Maximum 25 spaces per account.
* Maximum 1,000 testimonials per space.
* Additional widget customization.

Plan limits must be enforced on the server, not only in the user interface.

### FR-10: Billing and Stripe

* Display Free and Pro plans on the Billing page.
* Display the current plan and subscription status.
* Allow Free users to initiate a Pro upgrade.
* Redirect the user to Stripe-hosted Checkout.
* Handle successful and cancelled checkout returns.
* Verify Stripe webhook signatures.
* Update subscription records through verified webhook events.
* Display a success message after subscription confirmation.
* Show the active subscription when the user returns to Billing.
* Support subscription cancellation and payment-status updates.
* Never store raw card numbers or CVC codes in the application database.

Use Stripe test mode during development. A checkout redirect alone must not activate a paid subscription.

### FR-11: Security and Data Integrity

* Enforce authentication and ownership checks on private operations.
* Validate all input on the server.
* Prevent users from accessing another owner's spaces by changing a URL or identifier.
* Enforce Free and Pro limits on the server.
* Store passwords as secure hashes.
* Verify webhook signatures and handle duplicate webhook events safely.
* Rate-limit or otherwise protect public submission endpoints.
* Sanitize data rendered in public pages and widgets.
* Record timestamps for important entities.
* Use environment variables for secrets and database credentials.

## 5. Data Model

### User

* id
* name
* email
* passwordHash
* createdAt
* updatedAt

### Space

* id
* ownerId
* title
* subtitle
* slug
* theme
* ratingEnabled
* fieldConfiguration
* createdAt
* updatedAt

### Testimonial

* id
* spaceId
* customerName
* email
* companyName (optional)
* jobTitle (optional)
* socialProfileUrl (optional)
* profilePhotoUrl (optional)
* testimonialText
* rating (nullable)
* sharingConsent
* featured
* favorite
* hidden
* deletedAt (nullable)
* createdAt

### Subscription

* id
* userId
* plan
* status
* stripeCustomerId
* stripeSubscriptionId
* currentPeriodEnd
* createdAt
* updatedAt

### WidgetConfiguration

* id
* spaceId
* layout
* themeMode
* backgroundColor
* animation
* createdAt
* updatedAt

### WebhookEvent

* id
* stripeEventId
* eventType
* processedAt
* createdAt

Enforce unique constraints where appropriate, including user email, space slug, and Stripe event ID. Use foreign keys to preserve relationships.

## 6. Main Relationships

* One user owns many spaces.
* One space contains many testimonials.
* One user has a subscription record.
* One space has a widget configuration.
* Webhook events are tracked independently to prevent duplicate processing.

## 7. Main Pages

### Public

* Landing page
* Sign-up page
* Login page
* Public testimonial collection page
* Testimonial submission confirmation page
* Public testimonial widget

### Authenticated

* Dashboard
* Spaces list
* Create/edit space
* Testimonial inbox
* Widget builder
* Billing
* Account settings

## 8. Non-Functional Requirements

* Responsive layout for desktop, tablet, and mobile.
* Clear loading, success, empty, and error states.
* Accessible form labels and keyboard navigation.
* Secure handling of authentication and payment data.
* Reliable server-side validation and subscription enforcement.
* Maintainable component and database structure.
* Automated tests for critical workflows.
* Useful logs for diagnosing errors without exposing secrets.

## 9. Acceptance Criteria

The initial product is acceptable when:

1. A new user can register and log in.
2. The user can create up to three spaces on the Free plan.
3. The user can configure fields, ratings, and themes.
4. An unauthenticated customer can submit a testimonial through a public link.
5. The owner can see the submission in the inbox.
6. The owner can feature, favorite, hide, and delete testimonials.
7. Dashboard statistics reflect saved testimonials.
8. A widget can be configured, previewed, copied, and rendered on an external test page.
9. Free and Pro limits are enforced correctly.
10. Stripe test-mode checkout and verified webhooks update subscription status.
11. One user cannot access another user's private data.
12. Automated tests cover the critical happy paths and important negative scenarios.

## 10. Out of Scope for the Initial Version

* Multiple team members and organization accounts.
* AI-generated testimonial summaries.
* Advanced email campaigns and notifications.
* Multiple paid subscription tiers.
* Custom domains.
* Complex analytics and export features.
* Production payment processing until the test-mode flow is verified.

## 11. Assumptions Requiring Confirmation

* Pro pricing is $19.99 USD per month.
* The required "name and address" fields mean customer name and email address.
* Featured testimonials appear first in public widgets; favorites are an internal owner preference.
* The 25 themes are predefined visual presets rather than fully custom designs.
* Public collection pages may display eligible testimonials, subject to sharing consent.
* Stripe Checkout will collect card details on Stripe-hosted pages.
# Project Instructions

## Project

Minimal testimonial collection and management SaaS.

## Technology

* Next.js App Router
* TypeScript
* Tailwind CSS
* PostgreSQL with Neon
* Prisma ORM
* Auth.js
* Stripe Checkout and webhooks
* Playwright for UI testing

## Development Rules

* Read the PRD and data model before implementing a feature.
* Follow plan → implement → verify.
* Implement one feature at a time.
* Preserve existing working functionality.
* Use TypeScript and avoid unnecessary dependencies.
* Validate all untrusted input on the server.
* Enforce user ownership and subscription limits on the server.
* Never expose secrets or commit environment files.
* Never trust the client alone to confirm a payment.
* Add or update tests for each feature.
* Run relevant tests and checks before committing.
* Do not silently change the product requirements.
* Ask for approval before destructive database operations.

## Commands

Confirm these commands against package.json before using them.

* Install dependencies: npm install
* Run development server: npm run dev
* Production build: npm run build
* Lint: npm run lint
* Run Playwright tests: npx playwright test

## Git Rules

* Use descriptive branch names and commits.
* Keep unrelated features in separate commits.
* Review changes before merging.
* Never commit secrets.
