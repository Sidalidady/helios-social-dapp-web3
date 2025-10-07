const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SocialFeed", function () {
  let socialFeed;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const SocialFeed = await ethers.getContractFactory("SocialFeed");
    socialFeed = await SocialFeed.deploy();
    await socialFeed.waitForDeployment();
  });

  describe("Post Creation", function () {
    it("Should create a post successfully", async function () {
      const ipfsHash = "QmTest123";
      
      await expect(socialFeed.connect(user1).createPost(ipfsHash))
        .to.emit(socialFeed, "PostCreated");
      
      const post = await socialFeed.posts(1);
      expect(post.author).to.equal(user1.address);
      expect(post.ipfsHash).to.equal(ipfsHash);
      expect(post.isActive).to.be.true;
      expect(post.id).to.equal(1);
    });

    it("Should fail with empty IPFS hash", async function () {
      await expect(
        socialFeed.connect(user1).createPost("")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should increment post counter", async function () {
      await socialFeed.connect(user1).createPost("QmTest1");
      await socialFeed.connect(user1).createPost("QmTest2");
      
      const total = await socialFeed.getTotalPosts();
      expect(total).to.equal(2);
    });
  });

  describe("Likes", function () {
    beforeEach(async function () {
      await socialFeed.connect(user1).createPost("QmTest");
    });

    it("Should like a post", async function () {
      await expect(socialFeed.connect(user2).likePost(1))
        .to.emit(socialFeed, "PostLiked")
        .withArgs(1, user2.address, 1);
      
      const post = await socialFeed.posts(1);
      expect(post.likes).to.equal(1);
      
      const hasLiked = await socialFeed.hasLiked(1, user2.address);
      expect(hasLiked).to.be.true;
    });

    it("Should unlike a post", async function () {
      await socialFeed.connect(user2).likePost(1);
      
      await expect(socialFeed.connect(user2).unlikePost(1))
        .to.emit(socialFeed, "PostUnliked")
        .withArgs(1, user2.address, 0);
      
      const post = await socialFeed.posts(1);
      expect(post.likes).to.equal(0);
    });

    it("Should fail to like twice", async function () {
      await socialFeed.connect(user2).likePost(1);
      
      await expect(
        socialFeed.connect(user2).likePost(1)
      ).to.be.revertedWith("Already liked");
    });
  });

  describe("Follow System", function () {
    it("Should follow a user", async function () {
      await expect(socialFeed.connect(user1).followUser(user2.address))
        .to.emit(socialFeed, "UserFollowed")
        .withArgs(user1.address, user2.address);
      
      const isFollowing = await socialFeed.isFollowing(user1.address, user2.address);
      expect(isFollowing).to.be.true;
      
      const profile1 = await socialFeed.getUserProfile(user1.address);
      expect(profile1.followingCount).to.equal(1);
      
      const profile2 = await socialFeed.getUserProfile(user2.address);
      expect(profile2.followerCount).to.equal(1);
    });

    it("Should unfollow a user", async function () {
      await socialFeed.connect(user1).followUser(user2.address);
      
      await expect(socialFeed.connect(user1).unfollowUser(user2.address))
        .to.emit(socialFeed, "UserUnfollowed")
        .withArgs(user1.address, user2.address);
      
      const isFollowing = await socialFeed.isFollowing(user1.address, user2.address);
      expect(isFollowing).to.be.false;
    });

    it("Should fail to follow yourself", async function () {
      await expect(
        socialFeed.connect(user1).followUser(user1.address)
      ).to.be.revertedWith("Cannot follow yourself");
    });
  });

  describe("User Profile", function () {
    it("Should update user profile", async function () {
      const displayName = "Alice";
      const profileHash = "QmProfile123";
      
      await expect(
        socialFeed.connect(user1).updateProfile(displayName, profileHash)
      ).to.emit(socialFeed, "ProfileUpdated")
        .withArgs(user1.address, displayName, profileHash);
      
      const profile = await socialFeed.getUserProfile(user1.address);
      expect(profile.displayName).to.equal(displayName);
      expect(profile.profileIpfsHash).to.equal(profileHash);
    });
  });

  describe("Get Posts", function () {
    beforeEach(async function () {
      await socialFeed.connect(user1).createPost("QmPost1");
      await socialFeed.connect(user2).createPost("QmPost2");
      await socialFeed.connect(user1).createPost("QmPost3");
    });

    it("Should get recent posts", async function () {
      const posts = await socialFeed.getRecentPosts(0, 10);
      expect(posts.length).to.equal(3);
      expect(posts[0].ipfsHash).to.equal("QmPost3"); // Newest first
    });

    it("Should paginate posts", async function () {
      const posts = await socialFeed.getRecentPosts(1, 1);
      expect(posts.length).to.equal(1);
      expect(posts[0].ipfsHash).to.equal("QmPost2");
    });

    it("Should get user posts", async function () {
      const userPosts = await socialFeed.getUserPosts(user1.address);
      expect(userPosts.length).to.equal(2);
    });
  });
});
