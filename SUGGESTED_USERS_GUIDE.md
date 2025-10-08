# Suggested Users Feature - Implementation Guide

## Overview

The Suggested Users feature uses a sophisticated weighted scoring algorithm to recommend 3-5 users based on multiple factors including mutual connections, shared interests, engagement patterns, content similarity, and Web3 on-chain activity.

## Architecture

### Components

1. **`suggestedUsers.js`** - Core algorithm utility
2. **`SuggestedUsers.js`** - React component
3. **`SuggestedUsers.css`** - Galaxy-themed styling

### Weighted Scoring System

The algorithm uses the following weights:

- **25%** - Mutual Connections
- **30%** - Shared Interests (bio keywords, tags)
- **20%** - Engagement Overlap (liked similar posts)
- **15%** - Content Similarity (post topics)
- **10%** - Activity Level (recent posting frequency)
- **Bonus 10%** - Web3 On-chain Activity (transactions, balance)

## Algorithm Details

### 1. Mutual Connections Score

```javascript
// Calculates overlap in following lists
// Normalized: 10+ mutual connections = max score (1.0)
mutualScore = min(mutualCount / 10, 1)
```

**Example:**
- User A and User B both follow 5 same users → Score: 0.5
- User A and User B both follow 12 same users → Score: 1.0

### 2. Shared Interests Score

```javascript
// Uses Jaccard similarity on bio keywords
// Extracts keywords (>3 chars, excludes stop words)
sharedScore = intersection / union
```

**Example:**
- User A bio: "Crypto artist & NFT collector"
- User B bio: "NFT enthusiast and digital artist"
- Shared keywords: [crypto, artist, NFT, collector, enthusiast, digital]
- Score: 3/6 = 0.5

### 3. Engagement Overlap Score

```javascript
// Measures overlap in liked posts
// Higher score if users like similar content
engagementScore = overlappingLikes / totalLikes
```

**Example:**
- User A liked posts: [1, 2, 3, 5, 7]
- User B liked posts: [2, 3, 4, 5, 8]
- Overlap: [2, 3, 5] → Score: 3/8 = 0.375

### 4. Content Similarity Score

```javascript
// Compares topics in user posts
// Uses keyword extraction and Jaccard similarity
contentScore = sharedTopics / allTopics
```

**Example:**
- User A posts about: blockchain, DeFi, NFTs
- User B posts about: blockchain, crypto, NFTs
- Score: 2/4 = 0.5

### 5. Activity Level Score

```javascript
// Measures recent posting activity (last 30 days)
// Normalized: 20+ posts = max score
activityScore = min(recentPosts / 20, 1)
```

**Example:**
- User posted 15 times in last 30 days → Score: 0.75
- User posted 25 times in last 30 days → Score: 1.0

### 6. Web3 Activity Bonus

```javascript
// Checks on-chain activity
// Transaction count: 50+ txs = max score
// Balance: 10+ ETH = max score
web3Score = (txScore + balanceScore) / 2
```

**Example:**
- User has 30 transactions → txScore: 0.6
- User has 5 ETH → balanceScore: 0.5
- Final bonus: (0.6 + 0.5) / 2 = 0.55 → +5.5% to total score

## Privacy & Bot Filtering

The algorithm includes multiple filters to ensure quality suggestions:

### Bot Detection

1. **Excessive Posting Filter**
   - Flags accounts posting >20 times per hour
   - Prevents spam bot recommendations

2. **Content Repetition Filter**
   - Calculates unique content ratio
   - Flags accounts with >50% duplicate content

3. **Profile Completeness Filter**
   - Requires username
   - Requires either bio or posts

### Privacy Compliance

- No personal data is stored beyond blockchain records
- All calculations are done client-side
- Users can opt-out by not setting a bio

## Caching & Performance

### Cache Strategy

```javascript
// 5-minute TTL cache
const CACHE_TTL = 5 * 60 * 1000;
```

**Benefits:**
- Reduces computation for repeated requests
- Improves UX with instant results
- Automatically cleans expired entries

### Performance Optimizations

1. **Lazy Loading** - Only calculates when component mounts
2. **Parallel Processing** - Uses `Promise.all()` for concurrent scoring
3. **Early Filtering** - Removes ineligible users before scoring
4. **Memoization** - Caches keyword extraction results

## UI/UX Features

### Galaxy Theme

The component features a stunning space-themed design:

- **Twinkling Stars** - Animated background stars
- **Shimmer Effect** - Subtle card animations
- **Avatar Glow** - Pulsing glow around avatars
- **Smooth Transitions** - Slide-in animations for cards

### User Card Information

Each suggested user card displays:

1. **Avatar** - Profile image or initial placeholder
2. **Username** - @username format
3. **Bio** - Truncated to 60 characters
4. **Reason Tag** - Why they're suggested (e.g., "3 mutual followers")
5. **Post Count** - Number of posts
6. **High Match Badge** - ⭐ for scores >0.8
7. **Follow Button** - One-click follow action

### States

- **Loading** - Spinner with "Finding cosmic connections..."
- **Empty** - "No suggestions right now"
- **Error** - Retry button
- **Success** - List of 3-5 users

## Integration

### In App.js

```javascript
import SuggestedUsers from './components/SuggestedUsers';

// In right sidebar
<SuggestedUsers 
  currentUser={userProfile}
  allUsers={allUsers}
  allFollows={allFollows}
  allPosts={allPosts || []}
  onFollowChange={() => setRefreshTrigger(prev => prev + 1)}
/>
```

### Required Props

- `currentUser` - Current user's profile object
- `allUsers` - Array of all platform users
- `allFollows` - Array of follow relationships
- `allPosts` - Array of all posts
- `onFollowChange` - Callback when user follows someone

## Example Scoring Calculation

Let's calculate a score for suggesting User B to User A:

### User A Profile
- Following: [0x123, 0x456, 0x789]
- Bio: "Crypto enthusiast and blockchain developer"
- Liked posts: [1, 2, 3, 5]
- Posts: 15 in last 30 days

### User B Profile
- Following: [0x456, 0x789, 0xabc]
- Bio: "Blockchain developer building DeFi apps"
- Liked posts: [2, 3, 4, 5]
- Posts: 12 in last 30 days
- Transactions: 40
- Balance: 8 ETH

### Score Calculation

1. **Mutual Connections**: 2 mutual (0x456, 0x789)
   - Score: 2/10 = 0.2
   - Weighted: 0.2 × 0.25 = **0.05**

2. **Shared Interests**: Keywords [crypto, blockchain, developer, DeFi]
   - Intersection: 3 (crypto, blockchain, developer)
   - Union: 5
   - Score: 3/5 = 0.6
   - Weighted: 0.6 × 0.30 = **0.18**

3. **Engagement Overlap**: Liked posts [2, 3, 5]
   - Overlap: 3
   - Total unique: 6
   - Score: 3/6 = 0.5
   - Weighted: 0.5 × 0.20 = **0.10**

4. **Content Similarity**: Both post about blockchain/crypto
   - Score: 0.7 (estimated)
   - Weighted: 0.7 × 0.15 = **0.105**

5. **Activity Level**: 12 posts in 30 days
   - Score: 12/20 = 0.6
   - Weighted: 0.6 × 0.10 = **0.06**

6. **Web3 Bonus**:
   - TX Score: 40/50 = 0.8
   - Balance Score: 8/10 = 0.8
   - Average: 0.8
   - Bonus: 0.8 × 0.10 = **0.08**

### Final Score
```
0.05 + 0.18 + 0.10 + 0.105 + 0.06 + 0.08 = 0.575 (57.5%)
```

**Result**: User B would be suggested to User A with a moderate match score.

## Testing

### Manual Testing

1. **Create test accounts** with different profiles
2. **Vary bio content** to test shared interests
3. **Follow different users** to test mutual connections
4. **Like different posts** to test engagement overlap
5. **Post different content** to test content similarity

### A/B Testing

Test different weight configurations:

```javascript
// Configuration A (Current)
mutualConnections: 0.25
sharedInterests: 0.30
engagement: 0.20
contentSimilarity: 0.15
activityLevel: 0.10

// Configuration B (More social)
mutualConnections: 0.35
sharedInterests: 0.25
engagement: 0.25
contentSimilarity: 0.10
activityLevel: 0.05

// Configuration C (More content-focused)
mutualConnections: 0.15
sharedInterests: 0.35
engagement: 0.15
contentSimilarity: 0.25
activityLevel: 0.10
```

## Future Enhancements

### Machine Learning Integration

1. **Collaborative Filtering**
   - Use user-item matrix for recommendations
   - Implement matrix factorization (SVD)

2. **Neural Networks**
   - Train on user interaction data
   - Predict follow probability

3. **Natural Language Processing**
   - Better bio/post analysis
   - Sentiment analysis
   - Topic modeling (LDA)

### Additional Features

1. **Diversity Boost**
   - Ensure suggestions aren't all similar
   - Introduce serendipity factor

2. **Time-based Weighting**
   - Recent interactions weighted higher
   - Decay old engagement signals

3. **Community Detection**
   - Identify user clusters/communities
   - Suggest users from adjacent communities

4. **Feedback Loop**
   - Track which suggestions users follow
   - Adjust weights based on success rate

5. **Personalization**
   - Let users adjust their own weights
   - "More like this" / "Less like this" buttons

## Troubleshooting

### No Suggestions Appearing

1. Check if user has profile set
2. Verify `allUsers` array is populated
3. Check console for errors
4. Ensure Web3 provider is connected

### Slow Performance

1. Reduce number of users being scored
2. Increase cache TTL
3. Limit keyword extraction
4. Use pagination for large user bases

### Irrelevant Suggestions

1. Adjust weights in algorithm
2. Improve keyword extraction
3. Add more filters
4. Collect user feedback

## API Reference

### `getSuggestedUsers(params)`

Returns array of suggested users with scores.

**Parameters:**
```javascript
{
  currentUser: Object,      // Current user profile
  allUsers: Array,          // All platform users
  allFollows: Array,        // Follow relationships
  allPosts: Array,          // All posts
  web3Provider: Object,     // Web3 provider (optional)
  limit: Number            // Max suggestions (default: 5)
}
```

**Returns:**
```javascript
[
  {
    address: "0x...",
    username: "user123",
    bio: "...",
    profileImage: "...",
    score: 0.75,
    mutualFollowers: 3,
    postCount: 15
  },
  // ... more users
]
```

### `clearSuggestionsCache()`

Clears the suggestions cache. Useful for testing or manual refresh.

```javascript
import { clearSuggestionsCache } from './utils/suggestedUsers';

clearSuggestionsCache();
```

### `getMutualFollowers(userAddress, otherUserAddress, allFollows)`

Returns array of mutual follower addresses.

```javascript
const mutuals = getMutualFollowers(
  "0x123...",
  "0x456...",
  allFollows
);
// Returns: ["0xabc...", "0xdef..."]
```

## Conclusion

This suggested users feature provides a robust, performant, and visually appealing way to help users discover new connections on your Web3 social platform. The weighted algorithm balances multiple factors to ensure relevant, high-quality suggestions while maintaining privacy and filtering out bots.

The galaxy-themed UI creates an engaging user experience that fits perfectly with the Helios Social brand, and the caching system ensures smooth performance even with large user bases.

For questions or improvements, refer to the code comments or open an issue in the repository.
