# Analytics Time Filter Feature

## Overview
The Provider Dashboard analytics now includes time-based filtering tabs that allow providers to view rental distribution data across different time periods.

## Feature Location
- **File**: `src/app/provider/dashboard/page.tsx`
- **Section**: Rental Analytics Card (collapsible section)

## Time Period Options

The analytics section now includes 4 filtering tabs:

### 1. **Today** 
- Shows rentals created/started today
- Date range: Current day (00:00:00 - 23:59:59)
- Display: "Showing rentals from today (MM/DD/YYYY)"

### 2. **This Week**
- Shows rentals from the last 7 days
- Date range: 7 days before current date to now
- Display: "Showing rentals from the last 7 days"

### 3. **This Month** (Default)
- Shows rentals for the current calendar month
- Date range: First day of current month to last day of current month
- Display: "Showing rentals for [Month Year]"
- Example: "Showing rentals for October 2025"

### 4. **Last Month**
- Shows rentals from the previous calendar month
- Date range: First day of previous month to last day of previous month
- Display: "Showing rentals for [Previous Month Year]"
- Example: "Showing rentals for September 2025"

## Visual Components

### Tab Navigation
```
┌──────────┬────────────┬─────────────┬─────────────┐
│  Today   │ This Week  │ This Month  │ Last Month  │
└──────────┴────────────┴─────────────┴─────────────┘
```

### Pie Chart Display
Each tab shows:
1. **Time period description** (text above chart)
2. **Pie chart** visualizing vehicle type distribution
3. **Total rentals count** (text below chart)

### Empty State
When no data exists for a time period:
- TrendingUp icon (gray)
- Message: "No rental data for [period]"
- Suggestion: "Check other time periods for data"

## Data Filtering Logic

### Filter Function
```typescript
filterBookingsByPeriod(bookings, period)
```

**Parameters:**
- `bookings`: Array of Booking objects
- `period`: 'today' | 'week' | 'month' | 'lastMonth'

**Returns:** Filtered array of bookings

### Date Comparison
Uses `createdAt` field from booking, falls back to `startDate` if not available:
```typescript
const bookingDate = new Date(booking.createdAt || booking.startDate);
```

### Period Calculations

#### Today
```typescript
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
return bookingDay.getTime() === today.getTime();
```

#### This Week
```typescript
const weekAgo = new Date(today);
weekAgo.setDate(today.getDate() - 7);
return bookingDate >= weekAgo && bookingDate <= now;
```

#### This Month
```typescript
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
```

#### Last Month
```typescript
const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
```

## State Management

### New State Variable
```typescript
const [analyticsTimePeriod, setAnalyticsTimePeriod] = useState<'today' | 'week' | 'month' | 'lastMonth'>('month');
```

### Tab Change Handler
```typescript
<Tabs defaultValue="month" onValueChange={(value) => setAnalyticsTimePeriod(value as any)}>
```

## Data Processing

### Filtered Bookings
```typescript
const filteredBookings = filterBookingsByPeriod(providerBookings, analyticsTimePeriod);
```

### Chart Data Generation
```typescript
const rentalsByType = filteredBookings.reduce((acc, booking) => {
  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
  if (vehicle) {
    const type = vehicle.type;
    acc[type] = (acc[type] || 0) + 1;
  }
  return acc;
}, {} as Record<string, number>);
```

## User Interface

### Layout Structure
```
┌─────────────────────────────────────────┐
│ Rental Analytics                        │
│ Distribution of rentals across...      │
├─────────────────────────────────────────┤
│ ┌──┬──────┬──────────┬──────────┐      │
│ │  │ Week │ Month    │ LastMonth│      │
│ └──┴──────┴──────────┴──────────┘      │
│                                         │
│ Showing rentals for October 2025       │
│                                         │
│        ┌──────────────┐                │
│        │              │                │
│        │  Pie Chart   │                │
│        │              │                │
│        └──────────────┘                │
│                                         │
│      Total Rentals: 4                  │
└─────────────────────────────────────────┘
```

### Responsive Design
- Tabs: Full-width grid with 4 columns
- Chart: Responsive container (300px height)
- Labels: Responsive text sizing

## Color Scheme
Charts use consistent color palette:
```typescript
const COLORS = [
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884D8', // Purple
  '#82CA9D'  // Green
];
```

## Analytics Insights

### Metrics Displayed
1. **Vehicle Type Distribution** - Pie chart segments
2. **Total Rental Count** - Number below chart
3. **Time Period Context** - Description above chart

### Business Value
- **Today**: Monitor real-time daily performance
- **This Week**: Track weekly trends and patterns
- **This Month**: Monthly business performance overview
- **Last Month**: Historical comparison and reporting

## Use Cases

### Provider Workflows

#### 1. Daily Monitoring
```
Provider logs in → Views "Today" tab → Checks daily bookings
```

#### 2. Weekly Performance Review
```
Monday morning → Switch to "This Week" tab → Review 7-day trends
```

#### 3. Monthly Reporting
```
End of month → Switch to "This Month" tab → Generate monthly report
```

#### 4. Historical Comparison
```
New month starts → Switch to "Last Month" tab → Compare with current month
```

## Technical Dependencies

### Components Used
- `@/components/ui/tabs` - Tab navigation
- `recharts` - Pie chart visualization
- `@/components/ui/card` - Container layout
- `date-fns` - Date formatting (if needed)

### Icons
- `lucide-react`: `TrendingUp` (empty state)

### Data Sources
- `sakay-cebu-bookings` - Booking records from localStorage
- `sakay-cebu-vehicles` - Vehicle records for type mapping

## Performance Considerations

### Optimization
- Filter function runs on component render
- Memoization not needed for small datasets
- Consider `useMemo` for large booking arrays (>1000 items)

### Suggested Enhancement
```typescript
const filteredBookings = useMemo(
  () => filterBookingsByPeriod(providerBookings, analyticsTimePeriod),
  [providerBookings, analyticsTimePeriod]
);
```

## Future Enhancements

### Potential Features
1. **Custom Date Range** - Allow providers to select specific date ranges
2. **Export Data** - Download analytics as CSV/PDF
3. **Comparison View** - Side-by-side comparison of different periods
4. **Revenue Metrics** - Add earnings breakdown by time period
5. **Trend Indicators** - Show percentage change vs. previous period
6. **Booking Status Filter** - Filter by pending/active/completed within time periods
7. **Year-to-Date View** - Full year cumulative analytics
8. **Quarter View** - Q1, Q2, Q3, Q4 filtering
9. **Hourly Breakdown** - For "Today" tab, show hour-by-hour distribution
10. **Vehicle Performance** - Top performing vehicles per period

### Advanced Analytics
- **Booking Rate Trends** - Line chart showing bookings over time
- **Revenue Trends** - Financial performance visualization
- **Customer Retention** - Repeat customer analysis
- **Seasonal Patterns** - Year-over-year comparison
- **Predictive Analytics** - Forecast future bookings

## Testing Scenarios

### Test Cases
1. ✅ Today tab with no bookings → Shows empty state
2. ✅ Week tab with multiple bookings → Shows pie chart
3. ✅ Month tab as default → Displays current month data
4. ✅ Last month tab → Shows previous month data
5. ✅ Switch between tabs → Updates chart accordingly
6. ✅ Single vehicle type → Pie chart with one segment
7. ✅ Multiple vehicle types → Properly distributed segments

### Edge Cases
- No bookings at all → All tabs show empty state
- Bookings only in future → Current periods show empty
- Year boundary (December → January) → Last month calculation correct
- Month boundary → Current/last month correct

## Accessibility

### Keyboard Navigation
- Tab key navigates through period tabs
- Enter/Space activates selected tab
- Arrow keys move between tabs

### Screen Reader Support
- Tab labels clearly announced
- Chart data accessible via tooltip
- Empty states provide context

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Conclusion
The time-filtered analytics feature provides providers with flexible, powerful insights into their rental business performance across different time horizons, enabling better decision-making and business management.
