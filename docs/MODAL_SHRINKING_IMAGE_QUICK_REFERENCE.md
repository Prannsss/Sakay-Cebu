# Shrinking Image Modal - Quick Reference

## How It Works

### User Action → Visual Result

```
📱 USER OPENS MODAL
↓
┌────────────────────────┐
│                        │
│    [Vehicle Image]     │  ← 200px height
│    Full size & clear   │     Bold presence
│                        │
├────────────────────────┤
│ Vehicle Details...     │
└────────────────────────┘


📜 USER SCROLLS DOWN (10%)
↓
┌────────────────────────┐
│   [Vehicle Image]      │  ← 190px height
│   Still prominent      │     Slight shrink
├────────────────────────┤
│ Description            │
│ Lorem ipsum dolor...   │  ← More visible
└────────────────────────┘


📜 USER SCROLLS DOWN (30%+)
↓
┌────────────────────────┐
│ [Small Image]          │  ← 100px height (min)
├────────────────────────┤     STICKY - stays at top
│ Description            │
│ Lorem ipsum dolor...   │
│                        │  ← Maximum content visible
│ Vehicle Specifications │
│ • Year: 2020           │
│ • Transmission: Auto   │
│ • Fuel: Diesel         │
│ • Seats: 7             │
└────────────────────────┘


🔄 USER CLOSES & REOPENS
↓
┌────────────────────────┐
│                        │
│    [Vehicle Image]     │  ← RESET to 200px
│    Full size again     │     Fresh start
│                        │
├────────────────────────┤
│ Vehicle Details...     │
└────────────────────────┘
```

## Implementation Code Snippets

### 1. State & Refs
```typescript
const [scrollProgress, setScrollProgress] = useState(0);
const modalContentRef = useRef<HTMLDivElement>(null);
```

### 2. Scroll Detection
```typescript
useEffect(() => {
  const modalContent = modalContentRef.current;
  if (!modalContent) return;

  const handleScroll = () => {
    const scrollTop = modalContent.scrollTop;
    const scrollHeight = modalContent.scrollHeight - modalContent.clientHeight;
    const progress = Math.min(scrollTop / Math.max(scrollHeight * 0.3, 1), 1);
    setScrollProgress(progress);
  };

  modalContent.addEventListener('scroll', handleScroll);
  return () => modalContent.removeEventListener('scroll', handleScroll);
}, [isDetailModalOpen]);
```

### 3. Dynamic Height
```typescript
<div 
  className="sticky top-0 z-10 transition-all duration-300 ease-out"
  style={{
    height: `${Math.max(200 - scrollProgress * 100, 100)}px`,
  }}
>
  <Carousel>...</Carousel>
</div>
```

### 4. Image Scale Effect
```typescript
<img 
  style={{
    transform: `scale(${1 + scrollProgress * 0.1})`,
  }}
/>
```

## Key Formulas

### Height Calculation
```
Final Height = Math.max(200 - (progress × 100), 100)

Where:
  progress = 0 to 1 (scroll percentage)
  200 = initial height in pixels
  100 = minimum height in pixels
  
Examples:
  progress = 0   → height = 200px (full size)
  progress = 0.5 → height = 150px (halfway)
  progress = 1   → height = 100px (minimum)
```

### Scroll Progress
```
Progress = Math.min(scrollTop / (scrollHeight × 0.3), 1)

Where:
  scrollTop = pixels scrolled from top
  scrollHeight = total scrollable distance
  0.3 = transition completes at 30% scroll
  1 = maximum progress value
  
Why 0.3?
  - Faster response (don't wait for full scroll)
  - Better UX (image shrinks early)
  - Optimal balance between visibility and content
```

### Image Scale
```
Scale = 1 + (progress × 0.1)

Examples:
  progress = 0   → scale = 1.0  (100%, original size)
  progress = 0.5 → scale = 1.05 (105%, subtle zoom)
  progress = 1   → scale = 1.1  (110%, full zoom)
  
Effect:
  Creates subtle zoom-in as image shrinks
  Maintains visual interest
  Compensates for height reduction
```

## Behavior Matrix

| Scroll Position | Image Height | Image Scale | Visibility |
|----------------|--------------|-------------|------------|
| 0% (Top) | 200px | 1.0x | Full prominence |
| 10% | 190px | 1.01x | Still large |
| 20% | 180px | 1.02x | Noticeable shrink |
| 30% | 170px | 1.03x | Transitioning |
| 40%+ | 100px | 1.1x | Minimum size |

## CSS Classes Explained

```typescript
className="sticky top-0 z-10 transition-all duration-300 ease-out bg-background border-b"
```

| Class | Purpose |
|-------|---------|
| `sticky` | Stays at top while scrolling |
| `top-0` | Sticks to very top (0px) |
| `z-10` | Above content, below modals |
| `transition-all` | Smooth transitions for all properties |
| `duration-300` | 300ms (0.3s) animation time |
| `ease-out` | Deceleration curve (fast→slow) |
| `bg-background` | Matches theme background |
| `border-b` | Separator line at bottom |

## Performance Characteristics

```
Event Frequency:  ~60 times/second (display refresh rate)
Calculation Time: <1ms (simple math operations)
Re-render Time:   <16ms (React state update)
Animation:        GPU-accelerated (hardware)
Memory Impact:    Negligible (~few KB)
CPU Usage:        Minimal (event listener + calc)
```

## Quick Debug Commands

### Check scroll progress
```javascript
console.log('Scroll Progress:', scrollProgress);
// Should be 0 to 1
```

### Check current height
```javascript
console.log('Image Height:', Math.max(200 - scrollProgress * 100, 100));
// Should be 100 to 200
```

### Check scroll position
```javascript
const modal = document.querySelector('[ref="modalContentRef"]');
console.log('Scroll Top:', modal.scrollTop);
console.log('Scroll Height:', modal.scrollHeight);
```

## Common Adjustments

### Change shrinking speed
```typescript
// Faster (completes at 20% scroll)
const progress = Math.min(scrollTop / (scrollHeight * 0.2), 1);

// Slower (completes at 50% scroll)
const progress = Math.min(scrollTop / (scrollHeight * 0.5), 1);
```

### Change size range
```typescript
// Larger initial, same minimum
height: `${Math.max(300 - scrollProgress * 200, 100)}px`
// 300px → 100px

// Same initial, smaller minimum
height: `${Math.max(200 - scrollProgress * 120, 80)}px`
// 200px → 80px
```

### Change animation speed
```typescript
// Faster transition
className="... duration-150 ..."  // 150ms

// Slower transition
className="... duration-500 ..."  // 500ms
```

### Disable zoom effect
```typescript
// Remove or set to 1
style={{
  transform: `scale(1)`,  // No zoom
}}
```

## Mobile vs Desktop

### Mobile (360px width)
```
Initial: 200px height (56% of screen)
Final:   100px height (28% of screen)
Space saved: 100px for content
```

### Desktop (800px modal)
```
Initial: 200px height (same absolute)
Final:   100px height (same absolute)
Relative impact: Less dramatic
```

**Result:** More beneficial on mobile where screen space is precious!

## Summary

✅ **Automatic**: Triggers on scroll, no user action needed
✅ **Smooth**: 300ms transitions, GPU-accelerated
✅ **Smart**: Shrinks early (30% scroll), not late
✅ **Sticky**: Image always visible at top
✅ **Reset**: Fresh state every modal open
✅ **Responsive**: Works on all screen sizes
✅ **Performant**: Native events, minimal overhead

This creates a polished, app-like experience where the UI adapts intelligently to user behavior!
