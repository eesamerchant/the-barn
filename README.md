# The Barn - Basketball & Pickleball Court Booking System

A complete Next.js booking website for The Barn, an indoor basketball and pickleball court facility.

## Features

- **Calendar-based booking**: Interactive calendar to select available dates
- **Time slot selection**: Choose your preferred start and end times
- **Add-ons system**: Optional extras like equipment rental, coaching, etc.
- **Discount codes**: Support for percentage and fixed-amount discounts
- **E-transfer payment**: Track deposits and payment references
- **Responsive design**: Mobile-friendly interface with clean, modern styling
- **Real-time availability**: Checks bookings across both basketball court and event space
- **Price breakdown**: Clear total calculations including deposit amounts

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Date handling**: date-fns
- **Database client**: @supabase/supabase-js

## Project Structure

```
the-barn/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and Tailwind config
│   │   ├── layout.tsx           # Root layout with header/footer
│   │   ├── page.tsx             # Home page with hero and calendar
│   │   ├── book/
│   │   │   └── [date]/
│   │   │       └── page.tsx     # Booking form page
│   │   └── booking/
│   │       └── [id]/
│   │           └── page.tsx     # Booking confirmation page
│   ├── lib/
│   │   └── supabase.ts          # Supabase client and type definitions
│   └── components/
│       ├── Calendar.tsx         # Month calendar with available dates
│       ├── TimeSlotPicker.tsx   # Hour selection component
│       └── BookingForm.tsx      # Full booking form with payment
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── .env.local                   # Environment variables
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` with your Supabase credentials (already provided):
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SPACE_SLUG=basketball-court
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Features Explained

### Availability Logic
- Dates are available only if they have an `availability` record with `is_available=true`
- Time slots must have no overlapping `pending` or `confirmed` bookings
- The system checks across ALL spaces (basketball court AND event space) to prevent double-booking

### Pricing Breakdown
- Base rate: hourly_rate × number of hours
- Add-ons: optional extras with per-unit pricing
- Discounts: percentage or fixed amount (with minimum booking amount requirement)
- Deposit: 50% of total (configurable in settings)
- Total: base + add-ons - discount

### Booking States
- **Pending**: Initial state, waiting for deposit payment
- **Confirmed**: Deposit verified, booking confirmed
- **Completed**: Event has occurred
- **Cancelled**: Booking was cancelled

## Database Integration

The site integrates with these Supabase tables:

- **spaces**: Stores court information (name, description, rates, booking limits)
- **availability**: Admin-controlled date/hour availability
- **bookings**: Customer bookings with payment status
- **add_ons**: Optional extras customers can add
- **booking_add_ons**: Junction table linking bookings to add-ons
- **discount_codes**: Promotional codes with usage limits
- **settings**: System configuration (business hours, deposit %, etc.)

## Pages

### Home Page (`/`)
- Hero section with venue description
- Live calendar showing available dates
- Space rate and duration information
- Feature highlights section

### Booking Page (`/book/[date]`)
- Time slot picker with availability checking
- Comprehensive booking form
- Customer information collection
- Add-on selection
- Discount code application
- Price breakdown and deposit calculation
- E-transfer reference tracking

### Confirmation Page (`/booking/[id]`)
- Booking details summary
- Complete price breakdown
- Payment status tracking
- Customer information confirmation
- Next steps instructions

## Design System

**Colors:**
- Primary: Deep navy (#1a2332)
- Secondary: Cyan (#0ea5e9)
- Accent: Orange (#f97316)
- Background: Off-white (#fafafa)

**Components:**
- Cards with subtle shadows and borders
- Rounded corners (lg: 8px)
- Clean sans-serif typography
- Responsive grid layouts
- Accessible form controls

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_SPACE_SLUG`: Space identifier ('basketball-court')

## Deployment

Build for production:
```bash
npm run build
npm run start
```

The site is ready to deploy to Vercel or any Node.js hosting platform.

## Notes

- All date/time handling uses UTC internally, displayed in user's local timezone
- E-transfer references are tracked for manual payment verification
- The system prevents double-booking across both court spaces
- Discount codes can be limited by usage count and expiration date
- Responsive design works on mobile, tablet, and desktop

## Support

For issues or questions, contact the development team or refer to the Supabase documentation.
