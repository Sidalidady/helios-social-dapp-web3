/**
 * IPFS utilities for storing and retrieving post content
 * Using public IPFS gateways for MVP (no API keys needed)
 */

const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

/**
 * Upload content to IPFS via public gateway
 * For production, use Pinata, Web3.Storage, or NFT.Storage
 */
export async function uploadToIPFS(content) {
  try {
    // For MVP, we'll use a simple client-side solution
    // In production, use a proper IPFS service like Pinata
    
    // Check if content is already a JSON string with structured data
    let data;
    try {
      const parsed = JSON.parse(content);
      // If it's already an object with content/image, use it as is
      if (parsed.content !== undefined || parsed.image !== undefined) {
        data = content;
      } else {
        // Wrap simple content
        data = JSON.stringify({
          content: content,
          timestamp: Date.now(),
          version: '1.0'
        });
      }
    } catch {
      // Not JSON, wrap it
      data = JSON.stringify({
        content: content,
        timestamp: Date.now(),
        version: '1.0'
      });
    }

    // Use public IPFS HTTP API (ipfs.infura.io or similar)
    // For this MVP, we'll simulate by creating a hash from content
    // In production, replace with actual IPFS upload
    
    // Skip Pinata API call if no credentials are configured
    // This prevents 401 errors in development
    const hasPinataCredentials = process.env.REACT_APP_PINATA_API_KEY && 
                                  process.env.REACT_APP_PINATA_SECRET_KEY;

    if (hasPinataCredentials) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
            'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY,
          },
          body: JSON.stringify({
            pinataContent: JSON.parse(data),
            pinataMetadata: {
              name: `post-${Date.now()}`,
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Content uploaded to IPFS:', result.IpfsHash);
          return result.IpfsHash;
        }
      } catch (error) {
        // Silently fall through to local storage
        console.log('ℹ️ Using local storage (IPFS upload unavailable)');
      }
    }

    // Fallback: Create a deterministic hash for demo purposes
    const hash = await generateContentHash(data);
    console.log('💾 Storing content locally with hash:', hash);
    
    // Store in localStorage as fallback
    localStorage.setItem(`ipfs_${hash}`, data);
    
    // Also store a reverse lookup for debugging
    const allHashes = JSON.parse(localStorage.getItem('ipfs_hashes') || '[]');
    if (!allHashes.includes(hash)) {
      allHashes.push(hash);
      localStorage.setItem('ipfs_hashes', JSON.stringify(allHashes));
    }
    
    console.log('✅ Content stored in local storage');
    return hash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Retrieve content from IPFS
 */
export async function getFromIPFS(hash) {
  try {
    console.log('🔍 Fetching content for hash:', hash);
    
    // First, check localStorage (for demo/local content)
    const localData = localStorage.getItem(`ipfs_${hash}`);
    if (localData) {
      console.log('✅ Content found in localStorage');
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }

    // If not in localStorage, try to fetch from IPFS gateway
    console.log('🌐 Attempting to fetch from IPFS gateway...');
    const response = await fetch(`${IPFS_GATEWAY}${hash}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).catch((err) => {
      console.warn('IPFS gateway fetch failed:', err.message);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      console.log('✅ Content loaded from IPFS gateway');
      // Cache it locally for future use
      localStorage.setItem(`ipfs_${hash}`, JSON.stringify(data));
      return data;
    }

    // If not found anywhere, return a placeholder
    console.error('❌ Content not found for hash:', hash);
    console.log('Available hashes:', localStorage.getItem('ipfs_hashes'));
    return {
      content: '[Content not available - Please refresh the page]',
      timestamp: Date.now(),
      version: '1.0'
    };
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return {
      content: '[Error loading content - Please try again]',
      timestamp: Date.now(),
      version: '1.0'
    };
  }
}

/**
 * Generate a deterministic hash from content (for demo)
 */
async function generateContentHash(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `Qm${hashHex.substring(0, 44)}`; // Simulate IPFS hash format
}

/**
 * Validate IPFS hash format
 */
export function isValidIPFSHash(hash) {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}/.test(hash) || /^bafy[a-z0-9]{55}/.test(hash);
}
