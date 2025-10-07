// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SocialFeed
 * @dev Decentralized social feed contract for Helios Testnet
 * Stores post metadata on-chain, full content on IPFS for gas optimization
 */
contract SocialFeed is Ownable, ReentrancyGuard {
    
    struct Post {
        uint256 id;
        address author;
        string ipfsHash;      // IPFS hash for full content
        uint256 timestamp;
        uint256 likes;
        bool isActive;
    }
    
    struct UserProfile {
        string displayName;
        string profileIpfsHash;  // IPFS hash for profile data (avatar, bio, etc.)
        uint256 postCount;
        uint256 followerCount;
        uint256 followingCount;
        bool exists;
    }
    
    uint256 private postCounter;
    uint256 public constant MAX_POST_LENGTH = 280; // Character limit
    
    mapping(uint256 => Post) public posts;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => mapping(uint256 => bool)) public hasLikedPost;
    mapping(uint256 => mapping(address => bool)) public postLikes; // Track post likes
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(address => mapping(address => bool)) public userFollows; // Track user follows
    mapping(string => address) public usernameToAddress; // Track username ownership
    mapping(string => bool) public usernameTaken; // Track if username is taken
    
    uint256[] private postIds;
    
    // Events for efficient off-chain indexing
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string ipfsHash,
        uint256 timestamp
    );
    
    event PostLiked(
        uint256 indexed postId,
        address indexed liker,
        uint256 newLikeCount
    );
    
    event PostUnliked(
        uint256 indexed postId,
        address indexed unliker,
        uint256 newLikeCount
    );
    
    event UserFollowed(
        address indexed follower,
        address indexed following
    );
    
    event UserUnfollowed(
        address indexed follower,
        address indexed unfollowing
    );
    
    event ProfileUpdated(
        address indexed user,
        string displayName,
        string profileIpfsHash
    );
    
    event PostDeleted(
        uint256 indexed postId,
        address indexed author
    );
    
    event CommentAdded(
        uint256 indexed postId,
        address indexed commenter,
        string ipfsHash,
        uint256 timestamp
    );
    
    event ChatMessageSent(
        address indexed sender,
        string ipfsHash,
        uint256 timestamp
    );
    
    event CommentDeleted(
        uint256 indexed postId,
        uint256 indexed commentId,
        address indexed commenter
    );
    
    event CommentEdited(
        uint256 indexed postId,
        uint256 indexed commentId,
        address indexed commenter,
        string newIpfsHash
    );
    
    event CommentLiked(
        uint256 indexed commentId,
        address indexed liker
    );
    
    event CommentUnliked(
        uint256 indexed commentId,
        address indexed unliker
    );
    
    // Comment storage
    struct Comment {
        uint256 id;
        uint256 postId;
        address commenter;
        string ipfsHash;
        uint256 timestamp;
        uint256 likes;
        uint256 replyTo; // 0 if not a reply, otherwise ID of parent comment
        bool isActive;
    }
    
    mapping(uint256 => Comment[]) public postComments;
    mapping(uint256 => mapping(address => bool)) public commentLikes; // commentId => user => liked
    uint256 private commentCounter;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new post with IPFS hash
     * @param _ipfsHash IPFS hash containing the full post content
     */
    function createPost(string memory _ipfsHash) external nonReentrant {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        postCounter++;
        
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            likes: 0,
            isActive: true
        });
        
        postIds.push(postCounter);
        
        // Update user profile post count
        if (!userProfiles[msg.sender].exists) {
            userProfiles[msg.sender].exists = true;
        }
        userProfiles[msg.sender].postCount++;
        
        emit PostCreated(postCounter, msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Like a post
     * @param _postId ID of the post to like
     */
    function likePost(uint256 _postId) external {
        require(posts[_postId].isActive, "Post does not exist");
        require(!postLikes[_postId][msg.sender], "Already liked");
        
        postLikes[_postId][msg.sender] = true;
        posts[_postId].likes++;
        
        emit PostLiked(_postId, msg.sender, posts[_postId].likes);
    }
    
    /**
     * @dev Unlike a post
     * @param _postId ID of the post to unlike
     */
    function unlikePost(uint256 _postId) external {
        require(posts[_postId].isActive, "Post does not exist");
        require(postLikes[_postId][msg.sender], "Not liked yet");
        
        postLikes[_postId][msg.sender] = false;
        posts[_postId].likes--;
        
        emit PostUnliked(_postId, msg.sender, posts[_postId].likes);
    }
    
    /**
     * @dev Follow a user
     * @param _userToFollow Address of user to follow
     */
    function followUser(address _userToFollow) external {
        require(_userToFollow != msg.sender, "Cannot follow yourself");
        require(!userFollows[msg.sender][_userToFollow], "Already following");
        
        userFollows[msg.sender][_userToFollow] = true;
        
        // Update follower/following counts
        if (!userProfiles[msg.sender].exists) {
            userProfiles[msg.sender].exists = true;
        }
        if (!userProfiles[_userToFollow].exists) {
            userProfiles[_userToFollow].exists = true;
        }
        
        userProfiles[msg.sender].followingCount++;
        userProfiles[_userToFollow].followerCount++;
        
        emit UserFollowed(msg.sender, _userToFollow);
    }
    
    /**
     * @dev Unfollow a user
     * @param _userToUnfollow Address of user to unfollow
     */
    function unfollowUser(address _userToUnfollow) external {
        require(userFollows[msg.sender][_userToUnfollow], "Not following");
        
        userFollows[msg.sender][_userToUnfollow] = false;
        
        userProfiles[msg.sender].followingCount--;
        userProfiles[_userToUnfollow].followerCount--;
        
        emit UserUnfollowed(msg.sender, _userToUnfollow);
    }
    
    /**
     * @dev Update user profile
     * @param _displayName User's display name
     * @param _profileIpfsHash IPFS hash for profile data
     */
    function updateProfile(string memory _displayName, string memory _profileIpfsHash) external {
        require(bytes(_displayName).length > 0, "Username cannot be empty");
        require(bytes(_displayName).length <= 30, "Username too long");
        
        // Convert username to lowercase for case-insensitive comparison
        string memory lowerUsername = _toLower(_displayName);
        
        // If user already has a profile, check if they're changing username
        if (userProfiles[msg.sender].exists) {
            string memory currentUsername = _toLower(userProfiles[msg.sender].displayName);
            
            // If changing username, free up the old one
            if (keccak256(bytes(currentUsername)) != keccak256(bytes(lowerUsername))) {
                usernameTaken[currentUsername] = false;
                delete usernameToAddress[currentUsername];
            }
        }
        
        // Check if new username is already taken by someone else
        require(!usernameTaken[lowerUsername] || usernameToAddress[lowerUsername] == msg.sender, 
                "Username already taken");
        
        // Mark username as taken and assign to this address
        usernameTaken[lowerUsername] = true;
        usernameToAddress[lowerUsername] = msg.sender;
        
        if (!userProfiles[msg.sender].exists) {
            userProfiles[msg.sender].exists = true;
        }
        
        userProfiles[msg.sender].displayName = _displayName;
        userProfiles[msg.sender].profileIpfsHash = _profileIpfsHash;
        
        emit ProfileUpdated(msg.sender, _displayName, _profileIpfsHash);
    }
    
    /**
     * @dev Convert string to lowercase
     * @param _str String to convert
     */
    function _toLower(string memory _str) internal pure returns (string memory) {
        bytes memory bStr = bytes(_str);
        bytes memory bLower = new bytes(bStr.length);
        
        for (uint i = 0; i < bStr.length; i++) {
            // Convert uppercase A-Z to lowercase a-z
            if (uint8(bStr[i]) >= 65 && uint8(bStr[i]) <= 90) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        
        return string(bLower);
    }
    
    /**
     * @dev Check if username is available
     * @param _username Username to check
     */
    function isUsernameAvailable(string memory _username) external view returns (bool) {
        string memory lowerUsername = _toLower(_username);
        return !usernameTaken[lowerUsername];
    }
    
    /**
     * @dev Delete a post (only author can delete)
     * @param _postId ID of the post to delete
     */
    function deletePost(uint256 _postId) external {
        require(posts[_postId].isActive, "Post does not exist");
        require(posts[_postId].author == msg.sender, "Only author can delete");
        
        posts[_postId].isActive = false;
        
        emit PostDeleted(_postId, msg.sender);
    }
    
    /**
     * @dev Add a comment to a post
     * @param _postId ID of the post to comment on
     * @param _ipfsHash IPFS hash containing the comment content
     */
    function addComment(uint256 _postId, string memory _ipfsHash) external {
        require(posts[_postId].isActive, "Post does not exist");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        commentCounter++;
        
        Comment memory newComment = Comment({
            id: commentCounter,
            postId: _postId,
            commenter: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            likes: 0,
            replyTo: 0,
            isActive: true
        });
        
        postComments[_postId].push(newComment);
        
        emit CommentAdded(_postId, msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Add a reply to a comment
     * @param _postId ID of the post
     * @param _replyToCommentId ID of the comment being replied to
     * @param _ipfsHash IPFS hash containing the reply content
     */
    function addCommentReply(uint256 _postId, uint256 _replyToCommentId, string memory _ipfsHash) external {
        require(posts[_postId].isActive, "Post does not exist");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        commentCounter++;
        
        Comment memory newReply = Comment({
            id: commentCounter,
            postId: _postId,
            commenter: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            likes: 0,
            replyTo: _replyToCommentId,
            isActive: true
        });
        
        postComments[_postId].push(newReply);
        
        emit CommentAdded(_postId, msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Like a comment
     * @param _commentId ID of the comment to like
     */
    function likeComment(uint256 _commentId) external {
        require(!commentLikes[_commentId][msg.sender], "Already liked");
        
        commentLikes[_commentId][msg.sender] = true;
        
        emit CommentLiked(_commentId, msg.sender);
    }
    
    /**
     * @dev Unlike a comment
     * @param _commentId ID of the comment to unlike
     */
    function unlikeComment(uint256 _commentId) external {
        require(commentLikes[_commentId][msg.sender], "Not liked yet");
        
        commentLikes[_commentId][msg.sender] = false;
        
        emit CommentUnliked(_commentId, msg.sender);
    }
    
    /**
     * @dev Check if user has liked a comment
     * @param _commentId ID of the comment
     * @param _user Address of the user
     */
    function hasLikedComment(uint256 _commentId, address _user) external view returns (bool) {
        return commentLikes[_commentId][_user];
    }
    
    /**
     * @dev Delete a comment (only commenter can delete)
     * @param _postId ID of the post
     * @param _commentId ID of the comment to delete
     */
    function deleteComment(uint256 _postId, uint256 _commentId) external {
        Comment[] storage comments = postComments[_postId];
        
        for (uint256 i = 0; i < comments.length; i++) {
            if (comments[i].id == _commentId) {
                require(comments[i].commenter == msg.sender, "Only commenter can delete");
                require(comments[i].isActive, "Comment already deleted");
                
                comments[i].isActive = false;
                emit CommentDeleted(_postId, _commentId, msg.sender);
                return;
            }
        }
        
        revert("Comment not found");
    }
    
    /**
     * @dev Edit a comment (only commenter can edit)
     * @param _postId ID of the post
     * @param _commentId ID of the comment to edit
     * @param _newIpfsHash New IPFS hash for edited content
     */
    function editComment(uint256 _postId, uint256 _commentId, string memory _newIpfsHash) external {
        require(bytes(_newIpfsHash).length > 0, "IPFS hash cannot be empty");
        
        Comment[] storage comments = postComments[_postId];
        
        for (uint256 i = 0; i < comments.length; i++) {
            if (comments[i].id == _commentId) {
                require(comments[i].commenter == msg.sender, "Only commenter can edit");
                require(comments[i].isActive, "Comment is deleted");
                
                comments[i].ipfsHash = _newIpfsHash;
                emit CommentEdited(_postId, _commentId, msg.sender, _newIpfsHash);
                return;
            }
        }
        
        revert("Comment not found");
    }
    
    /**
     * @dev Get comments for a post
     * @param _postId ID of the post
     */
    function getPostComments(uint256 _postId) external view returns (Comment[] memory) {
        return postComments[_postId];
    }
    
    /**
     * @dev Send a chat message
     * @param _ipfsHash IPFS hash containing the message content
     */
    function sendChatMessage(string memory _ipfsHash) external {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(userProfiles[msg.sender].exists, "Profile required to chat");
        
        emit ChatMessageSent(msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Get recent posts with pagination
     * @param _offset Starting index
     * @param _limit Number of posts to fetch
     * @return Post array
     */
    function getRecentPosts(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Post[] memory) 
    {
        require(_limit > 0 && _limit <= 50, "Invalid limit");
        
        uint256 totalPosts = postIds.length;
        if (_offset >= totalPosts) {
            return new Post[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > totalPosts) {
            end = totalPosts;
        }
        
        uint256 resultSize = end - _offset;
        Post[] memory result = new Post[](resultSize);
        
        // Return posts in reverse order (newest first)
        for (uint256 i = 0; i < resultSize; i++) {
            uint256 postId = postIds[totalPosts - 1 - _offset - i];
            result[i] = posts[postId];
        }
        
        return result;
    }
    
    /**
     * @dev Get posts by a specific user
     * @param _user User address
     * @return Post array
     */
    function getUserPosts(address _user) external view returns (Post[] memory) {
        uint256 userPostCount = 0;
        
        // Count user's posts
        for (uint256 i = 0; i < postIds.length; i++) {
            if (posts[postIds[i]].author == _user && posts[postIds[i]].isActive) {
                userPostCount++;
            }
        }
        
        Post[] memory userPosts = new Post[](userPostCount);
        uint256 index = 0;
        
        // Collect user's posts (reverse order)
        for (uint256 i = postIds.length; i > 0; i--) {
            uint256 postId = postIds[i - 1];
            if (posts[postId].author == _user && posts[postId].isActive) {
                userPosts[index] = posts[postId];
                index++;
            }
        }
        
        return userPosts;
    }
    
    /**
     * @dev Get total post count
     */
    function getTotalPosts() external view returns (uint256) {
        return postIds.length;
    }
    
    /**
     * @dev Check if user has liked a post
     */
    function hasLiked(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }
    
    /**
     * @dev Check if user follows another user
     */
    function checkIsFollowing(address _follower, address _following) external view returns (bool) {
        return userFollows[_follower][_following];
    }
    
    /**
     * @dev Get user profile
     */
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }
}
