# ![24 Together Logo](header.png)

![Vercel](https://vercelbadge.vercel.app/api/thewindsofwinter/24-together) ![Known Vulnerabilities](https://snyk.io/test/github/thewindsofwinter/24-together/badge.svg)

This repo holds the code for [24 Together](https://24-together.vercel.app), a real-time multiplayer implementation of the [24 puzzle](https://en.wikipedia.org/wiki/24_(puzzle)), also known as 二十四点. The objective of this game is to be the first to find a sequence of arithmetic operators on the values of four given cards to make 24—a surprisingly engaging challenge that we maintainers spent hours playing as children. 

Unfortunately, current online implementations of this game are universally single-player, often have archaic user interfaces, and tend to be confined to the Sinosphere. We built this site to make sure that everyone can share the joy of playing this game with friends from anywhere.

## Technologies

This website was built on a serverless stack using [Next.js](https://nextjs.org/) on top of React for the front-end, [Firebase Realtime Database](https://firebase.google.com/docs/database) for persistent data storage, and [Pusher Channels](https://pusher.com/) for real-time chat and game history. We used [Tailwind](https://tailwindcss.com/) for most of our styling purposes, and [Vercel](https://vercel.app/) automatically deploys our app based on code changes.

Our code is structured like a typical Next.js project with API routes. The entry point to our app is in `pages/index.tsx` All API routes (of the form `/api/pusher[suffix]`) are contained in the `pages/api` subfolder. The `/components` folder contains functional subsections of the index page, and `/styling` contains what CSS we haven't reduced to Tailwind yet. `/public` contains SVG images of playing cards and other static assets.

To run a clone of this project, we suggest making your own Pusher instance and using your own Firebase. Set these environment values in either the deployment environment of your app or a `.env.local` file:

```
APP_ID = PUSHER APP ID
API_KEY = PUSHER API KEY
NEXT_PUBLIC_API_KEY = API KEY (AS ABOVE)
SECRET = PUSHER SECRET
NEXT_PUBLIC_CLUSTER = CLUSTER
```

## Contributing
This project is actively under development, and we welcome collaborators! The easiest way to help is to raise an issue with bugs or improvements to this project. You can also play an active role in developing the project—we'd love help on implementing new features and improvements. The following is our current roadmap:

**Sustainability**
 - [ ] Clean up code
 - [ ] Convert all CSS to Tailwind
 - [ ] Make site mobile-friendly

**Minor Improvements**
 - [ ] Add notifications for user join/leave
 - [ ] List online players (presence channel)
 - [ ] Add emotes in chat
 - [ ] Make menu to navigate to instructions/about

**Major Changes**
 - [ ] Implement rooms for players
 - [ ] Create persistent system for accounts
 - [ ] Set up leaderboards for times/scores
 - [ ] Redesign UI completely

Contact: resonance-stabilized@outlook.com
