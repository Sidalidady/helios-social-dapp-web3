/**
 * IPFS utilities for storing and retrieving post content
 * Using public IPFS gateways for MVP (no API keys needed)
 */

// Multiple IPFS gateways for fallback (CORS-friendly)
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

const IPFS_GATEWAY = IPFS_GATEWAYS[0];

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
 * Retrieve content from IPFS with multiple gateway fallback
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

    // Try multiple IPFS gateways
    console.log('🌐 Attempting to fetch from IPFS gateways...');
    
    for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
      const gateway = IPFS_GATEWAYS[i];
      console.log(`Trying gateway ${i + 1}/${IPFS_GATEWAYS.length}: ${gateway}`);
      
      try {
        const response = await fetch(`${gateway}${hash}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            try {
              data = JSON.parse(text);
            } catch {
              data = { content: text };
            }
          }
          
          console.log(`✅ Content loaded from gateway: ${gateway}`);
          // Cache it locally for future use
          localStorage.setItem(`ipfs_${hash}`, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn(`Gateway ${gateway} failed:`, err.message);
        // Continue to next gateway
      }
    }

    // If all gateways fail, return placeholder
    console.error('❌ Content not found on any gateway for hash:', hash);
    console.log('Available hashes:', localStorage.getItem('ipfs_hashes'));
    return {
      content: '[Content not available - IPFS gateways unreachable]',
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
