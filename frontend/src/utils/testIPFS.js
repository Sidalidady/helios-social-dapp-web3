/**
 * IPFS Testing Utility
 * Run this to test your IPFS setup
 */

import { uploadToIPFS, getFromIPFS } from './ipfs';

export async function testIPFSUpload() {
  console.log('🧪 Testing IPFS Upload...');
  
  try {
    const testContent = JSON.stringify({
      content: 'Hello from Helios Social DApp!',
      timestamp: Date.now(),
      test: true
    });
    
    console.log('📤 Uploading test content...');
    const hash = await uploadToIPFS(testContent);
    
    console.log('✅ Upload successful!');
    console.log('📝 IPFS Hash:', hash);
    console.log('🔗 View at: https://ipfs.io/ipfs/' + hash);
    
    return hash;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

export async function testIPFSRetrieval(hash) {
  console.log('🧪 Testing IPFS Retrieval...');
  console.log('📝 Hash:', hash);
  
  try {
    console.log('📥 Fetching content...');
    const data = await getFromIPFS(hash);
    
    console.log('✅ Retrieval successful!');
    console.log('📄 Content:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Retrieval failed:', error);
    throw error;
  }
}

export async function runFullIPFSTest() {
  console.log('🚀 Running Full IPFS Test...\n');
  
  try {
    // Test upload
    const hash = await testIPFSUpload();
    console.log('\n⏳ Waiting 2 seconds...\n');
    
    // Wait a bit for IPFS propagation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test retrieval
    await testIPFSRetrieval(hash);
    
    console.log('\n✅ All IPFS tests passed!');
    console.log('🎉 Your IPFS setup is working correctly!');
    
    return true;
  } catch (error) {
    console.error('\n❌ IPFS test failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your IPFS gateway URL');
    console.log('2. Verify Pinata API keys (if using Pinata)');
    console.log('3. Check browser console for errors');
    console.log('4. Try a different IPFS gateway');
    
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testIPFS = {
    upload: testIPFSUpload,
    retrieve: testIPFSRetrieval,
    runAll: runFullIPFSTest
  };
  
  console.log('💡 IPFS Test utilities loaded!');
  console.log('Run in console:');
  console.log('  testIPFS.runAll() - Run full test');
  console.log('  testIPFS.upload() - Test upload only');
  console.log('  testIPFS.retrieve(hash) - Test retrieval');
}
