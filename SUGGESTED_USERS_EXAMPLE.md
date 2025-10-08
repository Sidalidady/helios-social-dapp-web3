# Suggested Users - UI Example

## Visual Preview

```
┌─────────────────────────────────────────┐
│  ✨ Suggested Users              🔄     │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⭐ [Avatar]  @StarVoyager         │ │
│  │              Crypto artist & NFT  │ │
│  │              collector            │ │
│  │              ┌──────────────────┐ │ │
│  │              │ 12 mutual follow │ │ │
│  │              │ 25 posts         │ │ │
│  │              └──────────────────┘ │ │
│  │                        [Follow]   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    [Avatar]  @TechBit             │ │
│  │              Web3 dev, Helios     │ │
│  │              enthusiast           │ │
│  │              ┌──────────────────┐ │ │
│  │              │ Shared interest: │ │ │
│  │              │ Blockchain       │ │
│  │              │ 18 posts         │ │
│  │              └──────────────────┘ │ │
│  │                        [Follow]   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    [Avatar]  @GalaxyPoet          │ │
│  │              Posts about space &  │ │
│  │              poetry               │ │
│  │              ┌──────────────────┐ │ │
│  │              │ Liked your post  │ │
│  │              │ 32 posts         │ │
│  │              └──────────────────┘ │ │
│  │                        [Follow]   │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [Discover More]                 │
└─────────────────────────────────────────┘
```

## Example User Cards

### Card 1: High Match Score (⭐)
```
┌─────────────────────────────────────┐
│  ⭐                                  │
│  ╭─────╮                            │
│  │  S  │  @StarVoyager              │
│  ╰─────╯                            │
│         Crypto artist & NFT         │
│         collector exploring Web3    │
│                                     │
│  🔗 12 mutual followers             │
│  📝 25 posts                        │
│                                     │
│                    ┌──────────┐    │
│                    │  Follow  │    │
│                    └──────────┘    │
└─────────────────────────────────────┘
```

**Why Suggested:**
- 12 mutual connections (High)
- Shared interests: crypto, NFT, Web3
- Active user (25 posts)
- High overall score: 0.85

---

### Card 2: Shared Interest Match
```
┌─────────────────────────────────────┐
│  ╭─────╮                            │
│  │  T  │  @TechBit                  │
│  ╰─────╯                            │
│         Web3 developer building on  │
│         Helios blockchain           │
│                                     │
│  🏷️ Shared interest: Blockchain    │
│  📝 18 posts                        │
│                                     │
│                    ┌──────────┐    │
│                    │  Follow  │    │
│                    └──────────┘    │
└─────────────────────────────────────┘
```

**Why Suggested:**
- Strong shared interests (blockchain, Web3, Helios)
- Similar content topics
- Moderate activity level
- Overall score: 0.72

---

### Card 3: Engagement Match
```
┌─────────────────────────────────────┐
│  ╭─────╮                            │
│  │  G  │  @GalaxyPoet               │
│  ╰─────╯                            │
│         Poet writing about the      │
│         cosmos and technology       │
│                                     │
│  💜 Liked your recent post          │
│  📝 32 posts                        │
│                                     │
│                    ┌──────────┐    │
│                    │  Follow  │    │
│                    └──────────┘    │
└─────────────────────────────────────┘
```

**Why Suggested:**
- Engaged with your content
- Active poster (32 posts)
- Some shared interests
- Overall score: 0.68

---

## Interactive States

### Loading State
```
┌─────────────────────────────────────┐
│  ✨ Suggested Users              🔄 │
├─────────────────────────────────────┤
│                                     │
│          ⚪ ⚪ ⚪                    │
│         ⚪     ⚪                   │
│          ⚪ ⚪ ⚪                    │
│                                     │
│   Finding cosmic connections...     │
│                                     │
└─────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────┐
│  ✨ Suggested Users              🔄 │
├─────────────────────────────────────┤
│                                     │
│             🌟                      │
│                                     │
│     No suggestions right now        │
│                                     │
│   Check back later for new          │
│   connections!                      │
│                                     │
└─────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│  ✨ Suggested Users              🔄 │
├─────────────────────────────────────┤
│                                     │
│             ⚠️                      │
│                                     │
│   Failed to load suggestions        │
│                                     │
│        ┌──────────────┐             │
│        │  Try Again   │             │
│        └──────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

## Animation Effects

### 1. Slide-In Animation
Each card slides in from the right with a staggered delay:
- Card 1: 0ms delay
- Card 2: 100ms delay
- Card 3: 200ms delay
- Card 4: 300ms delay
- Card 5: 400ms delay

### 2. Twinkling Stars
Background stars twinkle at different rates:
```
★ (slow)    ✦ (medium)    ✧ (fast)
```

### 3. Avatar Glow
User avatars have a pulsing glow effect:
```
Normal → Bright → Normal (2s cycle)
```

### 4. Shimmer Effect
Cards have a subtle shimmer that passes across them:
```
← ← ← ← ← (diagonal shimmer every 3s)
```

### 5. Hover Effects
When hovering over a card:
- Card lifts up slightly (3px)
- Border glow intensifies
- Shadow becomes more prominent

## Color Scheme

### Primary Colors
- **Background**: `rgba(15, 12, 41, 0.95)` - Deep space blue
- **Card Background**: `rgba(30, 25, 60, 0.8)` - Lighter purple
- **Border**: `rgba(138, 43, 226, 0.3)` - Purple glow
- **Text**: `#ffffff` - White
- **Secondary Text**: `rgba(255, 255, 255, 0.7)` - Light gray

### Accent Colors
- **Primary Accent**: `#8a2be2` - Blue violet
- **Secondary Accent**: `#4b0082` - Indigo
- **Success**: `#10b981` - Green (for follow button)
- **Error**: `#ff6b6b` - Red

## Responsive Behavior

### Desktop (>768px)
- Full width in right sidebar
- 5 suggestions shown
- All animations enabled

### Tablet (768px - 480px)
- Slightly smaller cards
- 4-5 suggestions shown
- Reduced animation complexity

### Mobile (<480px)
- Compact card layout
- 3 suggestions shown
- Simplified animations for performance

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through cards
   - Enter to follow
   - Escape to close modals

2. **Screen Reader Support**
   - ARIA labels on all interactive elements
   - Descriptive alt text for avatars
   - Status announcements for loading/error states

3. **High Contrast Mode**
   - Increased border visibility
   - Stronger text contrast
   - Clear focus indicators

## Performance Metrics

### Target Metrics
- **Initial Load**: <500ms
- **Suggestion Calculation**: <1000ms
- **Cache Hit**: <50ms
- **Animation FPS**: 60fps
- **Memory Usage**: <10MB

### Optimization Techniques
1. Memoized keyword extraction
2. Parallel score calculation
3. Lazy loading of user data
4. Debounced refresh
5. Virtual scrolling (if >10 users)

## User Interaction Flow

```
1. User connects wallet
   ↓
2. Profile loads
   ↓
3. SuggestedUsers component mounts
   ↓
4. Shows loading state
   ↓
5. Fetches all users/posts/follows
   ↓
6. Calculates scores in parallel
   ↓
7. Filters and sorts results
   ↓
8. Displays top 5 suggestions
   ↓
9. User clicks "Follow"
   ↓
10. Updates blockchain
   ↓
11. Refreshes suggestions
   ↓
12. Shows updated list
```

## Example Scenarios

### Scenario 1: New User
**Profile:**
- No followers
- No posts
- Bio: "Just joined!"

**Suggestions:**
- Most active users
- Users with welcoming bios
- Popular community members

### Scenario 2: Active Crypto Enthusiast
**Profile:**
- 50 followers
- 100 posts about crypto
- Bio: "Bitcoin maximalist, DeFi trader"

**Suggestions:**
- Other crypto traders
- DeFi developers
- Users who liked similar posts
- Users in crypto communities

### Scenario 3: Artist
**Profile:**
- 200 followers
- 80 posts (mostly art)
- Bio: "Digital artist, NFT creator"

**Suggestions:**
- Other artists
- NFT collectors
- Users who liked art posts
- Gallery curators

## Testing Checklist

- [ ] Suggestions load correctly
- [ ] Scores are calculated accurately
- [ ] Follow button works
- [ ] Refresh updates suggestions
- [ ] Cache works properly
- [ ] Animations are smooth
- [ ] Responsive on all devices
- [ ] Accessible via keyboard
- [ ] Screen reader compatible
- [ ] Performance meets targets
- [ ] No memory leaks
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Loading states display correctly

## Conclusion

The Suggested Users feature provides an engaging, performant, and visually stunning way for users to discover new connections on Helios Social. The galaxy theme perfectly complements the platform's branding while the sophisticated algorithm ensures relevant, high-quality suggestions.
