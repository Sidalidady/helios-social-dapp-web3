/**
 * Suggested Users Algorithm
 * Weighted scoring system:
 * - 25% Mutual connections
 * - 30% Shared interests (tags, bio keywords)
 * - 20% Engagement overlap
 * - 15% Content similarity
 * - 10% Activity level
 */

// Cache for suggested users (5 minutes TTL)
const CACHE_TTL = 5 * 60 * 1000;
let suggestionsCache = new Map();

/**
 * Calculate mutual connections score
 * @param {string} currentUserAddress - Current user's address
 * @param {string} candidateAddress - Candidate user's address
 * @param {Array} allFollows - All follow relationships
 * @returns {number} Score between 0-1
 */
function calculateMutualConnections(currentUserAddress, candidateAddress, allFollows) {
  const currentUserFollows = allFollows
    .filter(f => f.follower.toLowerCase() === currentUserAddress.toLowerCase())
    .map(f => f.following.toLowerCase());
  
  const candidateFollows = allFollows
    .filter(f => f.follower.toLowerCase() === candidateAddress.toLowerCase())
    .map(f => f.following.toLowerCase());
  
  const mutualCount = currentUserFollows.filter(addr => 
    candidateFollows.includes(addr)
  ).length;
  
  // Normalize: 10+ mutual connections = max score
  return Math.min(mutualCount / 10, 1);
}

/**
 * Calculate shared interests score based on profile tags and bio
 * @param {Object} currentUser - Current user profile
 * @param {Object} candidateUser - Candidate user profile
 * @returns {number} Score between 0-1
 */
function calculateSharedInterests(currentUser, candidateUser) {
  if (!currentUser.bio || !candidateUser.bio) return 0;
  
  // Extract keywords from bios (simple approach)
  const currentKeywords = extractKeywords(currentUser.bio);
  const candidateKeywords = extractKeywords(candidateUser.bio);
  
  // Calculate Jaccard similarity
  const intersection = currentKeywords.filter(k => candidateKeywords.includes(k));
  const union = [...new Set([...currentKeywords, ...candidateKeywords])];
  
  return union.length > 0 ? intersection.length / union.length : 0;
}

/**
 * Extract keywords from text (simple tokenization)
 * @param {string} text
 * @returns {Array<string>}
 */
function extractKeywords(text) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return text
    .toLowerCase()
    .replace(/[^\w\s#]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 20); // Limit to top 20 keywords
}

/**
 * Calculate engagement overlap (liked similar posts, commented on same threads)
 * @param {string} currentUserAddress
 * @param {string} candidateAddress
 * @param {Array} allPosts - All posts with likes/comments
 * @returns {number} Score between 0-1
 */
function calculateEngagementOverlap(currentUserAddress, candidateAddress, allPosts) {
  const currentUserLikes = new Set();
  const candidateLikes = new Set();
  
  allPosts.forEach(post => {
    if (post.likes && Array.isArray(post.likes)) {
      if (post.likes.some(l => l.toLowerCase() === currentUserAddress.toLowerCase())) {
        currentUserLikes.add(post.id);
      }
      if (post.likes.some(l => l.toLowerCase() === candidateAddress.toLowerCase())) {
        candidateLikes.add(post.id);
      }
    }
  });
  
  const overlap = [...currentUserLikes].filter(id => candidateLikes.has(id)).length;
  const total = Math.max(currentUserLikes.size, candidateLikes.size);
  
  return total > 0 ? overlap / total : 0;
}

/**
 * Calculate content similarity based on post topics
 * @param {Array} currentUserPosts
 * @param {Array} candidatePosts
 * @returns {number} Score between 0-1
 */
function calculateContentSimilarity(currentUserPosts, candidatePosts) {
  if (!currentUserPosts.length || !candidatePosts.length) return 0;
  
  const currentTopics = currentUserPosts
    .map(p => extractKeywords(p.content || ''))
    .flat();
  
  const candidateTopics = candidatePosts
    .map(p => extractKeywords(p.content || ''))
    .flat();
  
  const intersection = currentTopics.filter(t => candidateTopics.includes(t));
  const union = [...new Set([...currentTopics, ...candidateTopics])];
  
  return union.length > 0 ? intersection.length / union.length : 0;
}

/**
 * Calculate activity level score
 * @param {Object} candidateUser
 * @param {Array} candidatePosts
 * @returns {number} Score between 0-1
 */
function calculateActivityLevel(candidateUser, candidatePosts) {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // Count recent posts (last 30 days)
  const recentPosts = candidatePosts.filter(p => {
    const postTime = p.timestamp ? p.timestamp * 1000 : 0;
    return postTime > thirtyDaysAgo;
  }).length;
  
  // Normalize: 20+ posts in 30 days = max score
  return Math.min(recentPosts / 20, 1);
}

/**
 * Calculate Web3 on-chain activity score
 * @param {string} candidateAddress
 * @param {Object} web3Provider
 * @returns {Promise<number>} Score between 0-1
 */
async function calculateWeb3Activity(candidateAddress, web3Provider) {
  try {
    // Check transaction count (activity indicator)
    const txCount = await web3Provider.getTransactionCount(candidateAddress);
    
    // Normalize: 50+ transactions = max score
    const txScore = Math.min(txCount / 50, 1);
    
    // Check balance (engagement indicator)
    const balance = await web3Provider.getBalance(candidateAddress);
    const balanceInEth = parseFloat(balance.toString()) / 1e18;
    const balanceScore = Math.min(balanceInEth / 10, 1); // 10+ ETH = max score
    
    // Average the scores
    return (txScore + balanceScore) / 2;
  } catch (error) {
    console.error('Error calculating Web3 activity:', error);
    return 0;
  }
}

/**
 * Calculate overall weighted score for a candidate user
 * @param {Object} params
 * @returns {Promise<number>} Weighted score
 */
async function calculateWeightedScore({
  currentUser,
  candidateUser,
  allFollows,
  allPosts,
  currentUserPosts,
  candidatePosts,
  web3Provider
}) {
  const weights = {
    mutualConnections: 0.25,
    sharedInterests: 0.30,
    engagement: 0.20,
    contentSimilarity: 0.15,
    activityLevel: 0.10
  };
  
  // Calculate individual scores
  const mutualScore = calculateMutualConnections(
    currentUser.address,
    candidateUser.address,
    allFollows
  );
  
  const interestsScore = calculateSharedInterests(currentUser, candidateUser);
  
  const engagementScore = calculateEngagementOverlap(
    currentUser.address,
    candidateUser.address,
    allPosts
  );
  
  const contentScore = calculateContentSimilarity(currentUserPosts, candidatePosts);
  
  const activityScore = calculateActivityLevel(candidateUser, candidatePosts);
  
  // Web3 activity (optional, adds bonus)
  let web3Score = 0;
  if (web3Provider) {
    web3Score = await calculateWeb3Activity(candidateUser.address, web3Provider);
  }
  
  // Calculate weighted total
  const baseScore = 
    (mutualScore * weights.mutualConnections) +
    (interestsScore * weights.sharedInterests) +
    (engagementScore * weights.engagement) +
    (contentScore * weights.contentSimilarity) +
    (activityScore * weights.activityLevel);
  
  // Add Web3 bonus (up to 10% extra)
  const finalScore = baseScore + (web3Score * 0.10);
  
  return Math.min(finalScore, 1); // Cap at 1.0
}

/**
 * Filter out bots and suspicious accounts
 * @param {Object} user
 * @param {Array} userPosts
 * @returns {boolean} True if user passes filters
 */
function passesPrivacyAndBotFilters(user, userPosts) {
  // Filter 1: Must have a username
  if (!user.username || user.username.trim().length === 0) return false;
  
  // Filter 2: Check for bot-like patterns (excessive posting)
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const recentPosts = userPosts.filter(p => {
    const postTime = p.timestamp ? p.timestamp * 1000 : 0;
    return postTime > oneHourAgo;
  }).length;
  
  if (recentPosts > 20) return false; // More than 20 posts/hour = likely bot
  
  // Filter 3: Check for spam patterns (repeated content)
  const uniqueContent = new Set(userPosts.map(p => p.content?.toLowerCase().trim()));
  const repetitionRatio = userPosts.length > 0 ? uniqueContent.size / userPosts.length : 1;
  if (repetitionRatio < 0.5) return false; // More than 50% duplicate content
  
  // Filter 4: Must have some bio or posts
  if (!user.bio && userPosts.length === 0) return false;
  
  return true;
}

/**
 * Get suggested users for a given user
 * @param {Object} params
 * @returns {Promise<Array>} Array of suggested users with scores
 */
export async function getSuggestedUsers({
  currentUser,
  allUsers,
  allFollows,
  allPosts,
  web3Provider,
  limit = 5
}) {
  // Check cache first
  const cacheKey = currentUser.address.toLowerCase();
  const cached = suggestionsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.suggestions.slice(0, limit);
  }
  
  // Get users the current user is already following
  const followingAddresses = new Set(
    allFollows
      .filter(f => f.follower.toLowerCase() === currentUser.address.toLowerCase())
      .map(f => f.following.toLowerCase())
  );
  
  // Get current user's posts
  const currentUserPosts = allPosts.filter(
    p => p.author.toLowerCase() === currentUser.address.toLowerCase()
  );
  
  // Filter candidate users
  const candidates = allUsers.filter(user => {
    const userAddr = user.address.toLowerCase();
    // Exclude self and already following
    if (userAddr === currentUser.address.toLowerCase()) return false;
    if (followingAddresses.has(userAddr)) return false;
    
    // Get user's posts for filtering
    const userPosts = allPosts.filter(p => p.author.toLowerCase() === userAddr);
    
    // Apply privacy and bot filters
    return passesPrivacyAndBotFilters(user, userPosts);
  });
  
  // Calculate scores for all candidates
  const scoredCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      const candidatePosts = allPosts.filter(
        p => p.author.toLowerCase() === candidate.address.toLowerCase()
      );
      
      const score = await calculateWeightedScore({
        currentUser,
        candidateUser: candidate,
        allFollows,
        allPosts,
        currentUserPosts,
        candidatePosts,
        web3Provider
      });
      
      // Calculate mutual followers count for display
      const mutualFollowers = allFollows.filter(f => {
        const currentFollowing = allFollows
          .filter(cf => cf.follower.toLowerCase() === currentUser.address.toLowerCase())
          .map(cf => cf.following.toLowerCase());
        
        return currentFollowing.includes(f.follower.toLowerCase()) &&
               f.following.toLowerCase() === candidate.address.toLowerCase();
      }).length;
      
      return {
        ...candidate,
        score,
        mutualFollowers,
        postCount: candidatePosts.length
      };
    })
  );
  
  // Sort by score (descending) and take top N
  const suggestions = scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Cache the results
  suggestionsCache.set(cacheKey, {
    suggestions,
    timestamp: Date.now()
  });
  
  // Clean old cache entries
  cleanCache();
  
  return suggestions;
}

/**
 * Clean expired cache entries
 */
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of suggestionsCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      suggestionsCache.delete(key);
    }
  }
}

/**
 * Clear suggestions cache (useful for testing or manual refresh)
 */
export function clearSuggestionsCache() {
  suggestionsCache.clear();
}

/**
 * Get mutual followers between two users
 * @param {string} userAddress
 * @param {string} otherUserAddress
 * @param {Array} allFollows
 * @returns {Array} Array of mutual follower addresses
 */
export function getMutualFollowers(userAddress, otherUserAddress, allFollows) {
  const userFollowers = allFollows
    .filter(f => f.following.toLowerCase() === userAddress.toLowerCase())
    .map(f => f.follower.toLowerCase());
  
  const otherFollowers = allFollows
    .filter(f => f.following.toLowerCase() === otherUserAddress.toLowerCase())
    .map(f => f.follower.toLowerCase());
  
  return userFollowers.filter(addr => otherFollowers.includes(addr));
}
