---
layout: post
title: Web3 is still centralized?
tags:
  - web3
  - blockchain
  - centralization
---

I'm still distilling what web3 is all about. What's clear, at least I think, is that it's a service or multiple services or more generally: a clients, built on top of distributed public ledger - a blockchain. A notable feature of such system is that it's decentralized - no one owns the blockchain, it's public, so you're enabled to _write_ to it whatever you want, without restrictions or fear of being blocked, censored or removed. In my opinion, such systems still suffer from centralization. Not from centralization of database, blockchain in this case, but centralization of clients and web services built on top. In this blog, I'd like to draw some parallels to existing distributed _systems_ with high client centralization.

Let's start with future Twitter, a web3 twitter. Its database is a blockchain, say Ethereum, where anyone can tweet. On top of that there might exists multiple competing clients that allow people to interact and to tweet. One such client could be an open-source say Electron based application, where either binaries will be provided or users, at least _power users_, will be able to build them by themselves. I imagine that there will exist multiple web based services that provide access to that database and even today's Twitter would be based on top of that. __The premise is: regardless of the multiple clients, the users will inevitably be drawn to one service, so the majority of users will still use single service to access public ledger of tweets and effectively centralizing tweeting.__ That service will eventually block users and content. Of course, you are still allowed to tweet by moving to a different client, but your tweets will no longer reach large audience.

I draw parallel to some existing _systems_. The open-source can be considered _distributed_. You can use whatever version control and you can host your code anywhere, but the majority of open-source code and users is centralized. The majority of users use GitHub, either as collaboration tool or to host their own code. If you are banned from GitHub, good luck reaching out to developers.

![StackOverflow Developer Survey 2020, 52,883 respondents](/assets/images/web3-is-still-centralized/stackoverflow-developer-survey-2020.png)
*StackOverflow Developer Survey 2020, 52,883 respondents [^1]*

![StackOverflow Developer Survey 2021, 22,528 respondents](/assets/images/web3-is-still-centralized/stackoverflow-developer-survey-2021.png)
*StackOverflow Developer Survey 2021, 22,528 respondents [^2]*

Another parallel is BitTorrent, a peer-to-peer file sharing, where files are distributed and decentralized. Majority of users use μTorrent.

![Usage share of BitTorrent clients, Wikipedia](/assets/images/web3-is-still-centralized/bittorrent-client-market-share-wikipedia.png)
*Usage share of BitTorrent clients, Wikipedia [^3] [^4]*

If, for whatever reason, μTorrent introduces content filtering and blocking, majority of users won't be able to access your content. Now, I'm not claiming if this is good or bad, since it's kind of questionable what kind of content you are providing so BitTorrent clients need to block it, but that is besides the point. The point is that high client centralization, diminishes the underlying decentralization and I think that it's inevitable that will happen to web3 services as well.

If you think that won't be happening - think again - it's already happening in NFT world. Some NFTs, a non-fungible tokens backed by Ethereum, got banned on the [OpenSea](https://opensea.io/) marketplace, after getting stolen from their owners. A client blocked the content from the blockchain.

> Digital marketplace OpenSea has banned the PHAYC and Phunky Ape Yacht Club (or PAYC) collections...
>
> [Two NFT copycats are fighting over which is the real fake Bored Ape Yacht Club](https://www.theverge.com/2021/12/30/22860010/bored-ape-yacht-club-payc-phayc-copycat-nft) (theverge.com)


## References

[^1]: [StackOverflow Developer Survey 2020, Collaboration tools](https://insights.stackoverflow.com/survey/2020#technology-collaboration-tools-all-respondents) (stackoverflow.com)

[^2]: [StackOverflow Developer Survey 2020, Other communities public or private](https://insights.stackoverflow.com/survey/2021#stack-overflow-community-now-new-other-comms-names-other) (stackoverflow.com)

[^3]: [Usage share of BitTorrent clients](https://en.wikipedia.org/wiki/Usage_share_of_BitTorrent_clients#2020) (wikipedia.org)

[^4]: [uTorrent is the Most Used BitTorrent Client By Far](https://torrentfreak.com/utorrent-is-the-most-used-bittorrent-client-by-far-200405/) (torrentfreak.com)
