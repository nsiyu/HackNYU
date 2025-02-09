# HackNYU

## Inspiration
When we landed in NYC our very first purchase was the fare to get to Brooklyn, our second was paying back our friend for breakfast. The infrastructure we use on a day to day basis without a second thought are tied closely to the access we have to reliable banking and the know how to navigate it. This is not the case for everyone, from our families with out access to older relatives with out the technical skills, they should still have access to reliable and easy banking.

## What it does
Banking is essential infrastructure to allow for smart money management, vital economic activity, and secure storage of value making it all the more important we make it accessible and natural to use for the underbanked and unsavvy. Towards this we created on a easy conversation based interface that allows users to transfer and manage funds all while dynamically providing and analyzing spending habits.

## How we built it
The core of our product is our ensemble of voice agent. We used Retell AI to power our inbound and outbound calling service to ingest information. From there we hand off to our custom agents to perform banking transaction and management tasks securely and quickly. We use chat gpt for our main text generation engine for dialog and response, augemented with the users information through a RAG system.
For our front end we use React deployed on Vercel and for our backend we use Fast API deployed on render. Our users are stored securely in supabase with authentication to ensure users are only able to see their information. We additionally manage our client account information and actions via the Capital One API.

## Challenges we ran into
One of the biggest challenges that we ran into was managing call and processing latency of our agent. We wanted the calls and conversations to feel natural for our "customers". Further more we had some setbacks initially when transitioning to the Capital One API.

## Accomplishments that we're proud of
We are particularly proud of getting it all done and deployed. We set out with a small set of core features hopping to get it right.

## What we learned
We learned and strengthened a wealth of technical skill.s Most notably we improved our ability to leverage agents to perform tasks securely and safely. Furthermore we opted to push for a fully deployed final product so learning how to create stable continuous deployment was certainly steep. Ie. how to not break production with every commit.

## What's next for Radio: Simple Accessible Banking
Adding more banking features like wider support for more stable coin pairs to offer individuals fiat alternative currencies to internationally underbanked communities.
