import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractData } from '../utils/contract';
import './FollowButton.css';

function FollowButton({ targetAddress, targetUsername, size = 'medium' }) {
  const { address } = useAccount();
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if following from blockchain
  const { data: followStatus, refetch: refetchFollowStatus } = useReadContract({
    address: contractData.address,
    abi: contractData.abi,
    functionName: 'checkIsFollowing',
    args: [address, targetAddress],
    enabled: !!address && !!targetAddress && address !== targetAddress,
  });

  // Write contract hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Update follow status from blockchain
  useEffect(() => {
    if (followStatus !== undefined) {
      setIsFollowing(followStatus);
      console.log('Follow status from blockchain:', followStatus);
    }
  }, [followStatus]);

  // Refetch after transaction success
  useEffect(() => {
    if (isSuccess) {
      console.log('✅ Follow/Unfollow transaction successful!');
      setTimeout(() => {
        refetchFollowStatus();
      }, 1000);
    }
  }, [isSuccess, refetchFollowStatus]);

  const handleFollow = async () => {
    if (!address || !targetAddress || address.toLowerCase() === targetAddress.toLowerCase()) {
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow on blockchain
        console.log('📤 Unfollowing user on blockchain:', targetAddress);
        writeContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'unfollowUser',
          args: [targetAddress],
        });
      } else {
        // Follow on blockchain
        console.log('📤 Following user on blockchain:', targetAddress);
        writeContract({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'followUser',
          args: [targetAddress],
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status: ' + error.message);
    }
  };

  // Don't show button for own profile
  if (!address || !targetAddress || address.toLowerCase() === targetAddress.toLowerCase()) {
    return null;
  }

  const buttonClass = `follow-button ${size} ${isFollowing ? 'following' : 'not-following'}`;

  const isProcessing = isPending || isConfirming;

  return (
    <button
      className={buttonClass}
      onClick={handleFollow}
      disabled={isProcessing}
      title={isFollowing ? 'Unfollow this user' : 'Follow this user'}
    >
      {isProcessing ? (
        <>
          <Loader2 size={size === 'small' ? 14 : 16} className="spinning" />
          <span>{isPending ? 'Confirming...' : 'Processing...'}</span>
        </>
      ) : isFollowing ? (
        <>
          <UserMinus size={size === 'small' ? 14 : 16} />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus size={size === 'small' ? 14 : 16} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}

export default FollowButton;
