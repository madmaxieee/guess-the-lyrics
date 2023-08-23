import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type SongData } from "@/utils/azlyricsParser";

const mockData: SongData = {
  path: "taylorswift/lovestory",
  title: "Love Story",
  artist: "Taylor Swift",
  album: "Fearless",
  coverPhotoURL:
    "https://www.azlyrics.com/images/albums/699/28b9efd2b441f00110868e34ee368189.jpg",
  lyrics:
    "We were both young when I first saw you\n" +
    "I close my eyes and the flashback starts:\n" +
    "I'm standing there\n" +
    "On a balcony in summer air\n" +
    "\n" +
    "See the lights, see the party, the ball gowns\n" +
    "See you make your way through the crowd\n" +
    'And say, "Hello."\n' +
    "Little did I know\n" +
    "\n" +
    "That you were Romeo, you were throwing pebbles\n" +
    'And my daddy said, "Stay away from Juliet."\n' +
    "And I was crying on the staircase\n" +
    `Begging you, "Please don't go."\n` +
    "And I said\n" +
    "\n" +
    '"Romeo, take me somewhere we can be alone\n' +
    "I'll be waiting. All there's left to do is run\n" +
    "You'll be the prince and I'll be the princess\n" +
    `It's a love story. Baby, just say 'Yes'."\n` +
    "\n" +
    "So, I sneak out to the garden to see you\n" +
    "We keep quiet 'cause we're dead if they knew\n" +
    "So, close your eyes\n" +
    "Escape this town for a little while\n" +
    "Oh, oh\n" +
    "\n" +
    "'Cause you were Romeo. I was a scarlet letter\n" +
    'And my daddy said, "Stay away from Juliet."\n' +
    "But you were everything to me\n" +
    `I was begging you, "Please don't go!"\n` +
    "And I said\n" +
    "\n" +
    '"Romeo, take me somewhere we can be alone\n' +
    "I'll be waiting. All there's left to do is run\n" +
    "You'll be the prince and I'll be the princess\n" +
    "It's a love story. Baby, just say 'Yes'\n" +
    "\n" +
    "Romeo, save me. They're tryna tell me how to feel\n" +
    "This love is difficult but it's real\n" +
    "Don't be afraid. We'll make it out of this mess\n" +
    `It's a love story. Baby, just say 'Yes'."\n` +
    "\n" +
    "Oh, oh, oh\n" +
    "\n" +
    "I got tired of waiting\n" +
    "Wondering if you were ever coming around\n" +
    "My faith in you was fading\n" +
    "When I met you on the outskirts of town\n" +
    "And I said\n" +
    "\n" +
    `"Romeo, save me. I've been feeling so alone\n` +
    "I keep waiting for you, but you never come\n" +
    `Is this in my head? I don't know what to think."\n` +
    "He knelt to the ground and pulled out a ring and said\n" +
    "\n" +
    `"Marry me, Juliet. You'll never have to be alone\n` +
    "I love you, and that's all I really know\n" +
    "I talked to your dad. Go pick out a white dress\n" +
    `It's a love story. Baby, just say 'Yes'."\n` +
    "\n" +
    "Oh, oh, oh, oh, oh, oh\n" +
    "\n" +
    "'Cause we were both young when I first saw you",
};

const mockResults = [
  {
    title: "Adele- Hello",
    url: "https://www.azlyrics.com/lyrics/adele/hello.html",
  },
  {
    title: "LionelRichie - Hello",
    url: "https://www.azlyrics.com/lyrics/lionelrichie/hello.html",
  },
  {
    title: "Beyonce- Hello",
    url: "https://www.azlyrics.com/lyrics/beyonceknowles/hello.html",
  },
  {
    title: "Eminem- Hello",
    url: "https://www.azlyrics.com/lyrics/eminem/hello.html",
  },
  {
    title: "Eminem- Hello",
    url: "https://www.azlyrics.com/lyrics/eminem/hello1.html",
  },
  {
    title: "Eminem- Hello",
    url: "https://www.azlyrics.com/lyrics/eminem/hello2.html",
  },
  {
    title: "Eminem- Hello",
    url: "https://www.azlyrics.com/lyrics/eminem/hello3.html",
  },
  {
    title: "Eminem- Hello",
    url: "https://www.azlyrics.com/lyrics/eminem/hello4.html",
  },
];

export const mockRouter = createTRPCRouter({
  songData: publicProcedure.query(() => mockData),
  searchResults: publicProcedure
    .input(z.object({ query: z.string(), topN: z.number().max(20).default(5) }))
    .query(({ input }) => mockResults.slice(0, input.topN)),
});
