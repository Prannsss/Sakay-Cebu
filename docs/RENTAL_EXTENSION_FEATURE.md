# Rental Extension Feature

## Overview
The rental extension feature allows clients to request extensions for their active rentals and providers to approve and process these extensions.

## Client-Side Feature (Dashboard)

### Location
- **File**: `src/app/dashboard/page.tsx`
- **Section**: My Rentals > Active bookings

### Functionality

#### 1. Request Extension Button
- Appears only for **active** rentals
- Located below the booking details
- Icon: CalendarPlus

#### 2. Extension Request Modal
When the "Request Extension" button is clicked:

**Modal Fields:**
- **Current Return Date**: Displays existing return date
- **Current Total**: Shows current booking price
- **Extend up to**: Date picker input
  - Min date: Current return date + 1 day
  - Shows calculated additional days
- **Reason (Optional)**: Textarea for explanation

**Submit Action:**
- Validates that extension date is after current return date
- Calculates extension days
- Creates a conversation with the provider (if doesn't exist)
- Sends formatted message to provider with:
  - Vehicle model
  - Current return date
  - Requested extension date
  - Number of additional days
  - Reason (if provided)
- Updates conversation's last activity
- Shows success toast notification

**Message Format:**
```
🔔 EXTENSION REQUEST

I would like to extend my rental for [Vehicle Model].

Current Return Date: [Date]
Requested Extension: [New Date] (+X day(s))

Reason: [Optional reason text]

Please let me know if this is possible. Thank you!
```

## Provider-Side Feature (Rental Requests)

### Location
- **File**: `src/app/provider/rental-requests/page.tsx`
- **Tab**: Active Bookings
- **Section**: Next to "Mark as Returned" button

### Functionality

#### 1. Extend Rental Button
- Appears for active bookings that have been picked up
- Located above "Mark as Returned" button
- Icon: CalendarPlus
- Variant: outline (secondary style)

#### 2. Extension Modal
When the "Extend Rental" button is clicked:

**Modal Header:**
- Shows vehicle model and client name

**Modal Fields:**
- **Current Return Date**: Displays existing return date
- **Current Total**: Shows current booking price
- **New Return Date**: Date picker input
  - Min date: Current return date + 1 day
  - Shows calculated additional days
- **Additional Price (₱)**: Number input
  - Step: 100
  - Shows new total price calculation

**Submit Action:**
- Validates all required fields are filled
- Validates new date is after current date
- Calculates extension days
- Calculates new total price (current + additional)
- Updates booking record:
  - `endDate`: New return date
  - `totalPrice`: Updated total
  - `extendedAt`: Timestamp
  - `extensionDays`: Number of additional days
- Sends confirmation message to client with:
  - Vehicle model
  - New return date
  - Extension days
  - Additional cost
  - New total price
- Updates conversation's last activity
- Shows success alert

**Confirmation Message Format:**
```
✅ RENTAL EXTENDED

Your rental for [Vehicle Model] has been extended!

New Return Date: [Date]
Extension: +X day(s)
Additional Cost: ₱X,XXX
New Total: ₱X,XXX

Thank you for choosing our service!
```

## Data Storage

### Updated Booking Properties
When a rental is extended, the booking object includes:
```typescript
{
  endDate: string;           // Updated return date
  totalPrice: number;        // Updated total cost
  extendedAt?: string;       // Timestamp of extension
  extensionDays?: number;    // Number of days extended
}
```

### Message Storage
- Messages stored in: `sakay-cebu-messages-${conversationId}`
- Conversation updated in: `sakay-cebu-conversations`
- Both client requests and provider confirmations create message records

## User Flow

### Client Journey
1. Client views "My Rentals" dashboard
2. Sees "Request Extension" button on active rental
3. Clicks button to open modal
4. Selects new return date
5. Optionally provides reason
6. Submits request
7. Message sent to provider
8. Receives confirmation in messages when provider approves

### Provider Journey
1. Provider receives extension request message
2. Views active rentals in "Rental & Booking Requests"
3. Clicks "Extend Rental" button
4. Reviews client request (via messages)
5. Sets new return date
6. Enters additional cost
7. Confirms extension
8. System updates booking and notifies client

## Benefits

### For Clients
- Easy self-service extension requests
- Clear communication channel with providers
- Immediate feedback on submission
- Transparent pricing updates

### For Providers
- Streamlined extension approval process
- Flexible pricing for extensions
- Automatic booking updates
- Professional confirmation messages
- Better revenue management

## Technical Notes

### Dependencies
- `date-fns`: Date formatting and calculations
- `lucide-react`: CalendarPlus, Send, CheckCircle icons
- `@/components/ui/dialog`: Modal component
- `@/components/ui/input`: Form inputs
- `@/components/ui/textarea`: Reason field
- `@/hooks/use-toast`: Client-side notifications

### State Management
- Uses `useLocalStorage` hook for persistent data
- Updates bookings array reactively
- Manages conversations and messages separately
- Refresh keys trigger re-renders after updates

### Validation
- Date validation prevents past dates
- Price validation ensures numeric input
- Required field checks before submission
- Minimum date calculations prevent invalid extensions

## Future Enhancements
- Auto-calculate suggested additional price based on daily rate
- Maximum extension limits per booking
- Extension request history tracking
- Email/SMS notifications for extension events
- Multiple extension support with complete audit trail
- Rejection reason for declined extensions
