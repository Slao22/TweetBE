export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  EmailVerifyToken,
  ForgotPasswordToken
}

export enum MediaType {
  Image,
  Video
}

export enum TweetType {
  Tweet,
  Retweet,
  QuoteTweet,
  Comment
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}
