import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  type ArtistData,
  type SongData,
} from "@/server/scrapers/azlyricsParser";

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

const mockArtistSongList: ArtistData = {
  name: "Bebe Rexha",
  albums: [
    {
      name: "I Don't Wanna Grow Up",
      songs: [
        {
          title: "I Don't Wanna Grow Up",
          path: "beberexha/idontwannagrowup",
        },
        {
          title: "Sweet Beginnings",
          path: "beberexha/sweetbeginnings",
        },
        {
          title: "I'm Gonna Show You Crazy",
          path: "beberexha/imgonnashowyoucrazy",
        },
        {
          title: "Pray",
          path: "beberexha/pray",
        },
        {
          title: "I Can't Stop Drinking About You",
          path: "beberexha/icantstopdrinkingaboutyou",
        },
      ],
      coverPhotoURL:
        "https://www.azlyrics.com/images/albums/381/dc121f8f2f85bfc9f2f778117c25484e.jpg",
    },
    {
      name: "All Your Fault: Pt 1",
      songs: [
        {
          title: "Atmosphere",
          path: "beberexha/atmosphere",
        },
        {
          title: "I Got You",
          path: "beberexha/igotyou",
        },
        {
          title: "Small Doses",
          path: "beberexha/smalldoses",
        },
        {
          title: "F.F.F. (Fuck Fake Friends)",
          path: "beberexha/fuckfakefriends",
        },
        {
          title: "Gateway Drug",
          path: "beberexha/gatewaydrug",
        },
        {
          title: "Bad Bitch",
          path: "beberexha/badbitch",
        },
      ],
      coverPhotoURL:
        "https://www.azlyrics.com/images/albums/448/dd798324c37cb9e3400b737668f247fb.jpg",
    },
    {
      name: "All Your Fault: Pt 2",
      songs: [
        {
          title: "That's It",
          path: "beberexha/thatsit",
        },
        {
          title: "I Got Time",
          path: "beberexha/igottime",
        },
        {
          title: "The Way I Are (Dance With Somebody)",
          path: "beberexha/dancewithsomebody",
        },
        {
          title: "(Not) The One",
          path: "beberexha/nottheone",
        },
        {
          title: "Comfortable",
          path: "beberexha/comfortable",
        },
        {
          title: "Meant To Be",
          path: "beberexha/meanttobe",
        },
      ],
      coverPhotoURL:
        "https://www.azlyrics.com/images/albums/493/305772ade163408d9babff8bf23d009d.jpg",
    },
    {
      name: "Expectations",
      songs: [
        {
          title: "Ferrari",
          path: "beberexha/ferrari",
        },
        {
          title: "I'm A Mess",
          path: "beberexha/imamess",
        },
        {
          title: "2 Souls On Fire",
          path: "beberexha/2soulsonfire",
        },
        {
          title: "Shining Star",
          path: "beberexha/shiningstar",
        },
        {
          title: "Knees",
          path: "beberexha/knees",
        },
        {
          title: "I Got You",
          path: "beberexha/igotyou",
        },
        {
          title: "Self Control",
          path: "beberexha/selfcontrol",
        },
        {
          title: "Sad",
          path: "beberexha/sad",
        },
        {
          title: "Mine",
          path: "beberexha/mine",
        },
        {
          title: "Steady",
          path: "beberexha/steady",
        },
        {
          title: "Don't Get Any Closer",
          path: "beberexha/dontgetanycloser",
        },
        {
          title: "Grace",
          path: "beberexha/grace",
        },
        {
          title: "Pillow",
          path: "beberexha/pillow",
        },
        {
          title: "Meant To Be",
          path: "beberexha/meanttobe",
        },
        {
          title: "I Can't Stop Drinking About You (Chainsmokers Remix)",
          path: "beberexha/icantstopdrinkingaboutyouchainsmokersremix",
        },
        {
          title: "I Got You (Cheat Codes Remix)",
          path: "beberexha/igotyoucheatcodesremix",
        },
      ],
      coverPhotoURL:
        "https://www.azlyrics.com/images/albums/561/b2fcf454cad87b757efbee7152b4a7a3.jpg",
    },
    {
      name: "Better Mistakes",
      songs: [
        {
          title: "Break My Heart Myself",
          path: "beberexha/breakmyheartmyself",
        },
        {
          title: "Sabotage",
          path: "beberexha/sabotage",
        },
        {
          title: "Trust Fall",
          path: "beberexha/trustfall",
        },
        {
          title: "Better Mistakes",
          path: "beberexha/bettermistakes",
        },
        {
          title: "Sacrifice",
          path: "beberexha/sacrifice",
        },
        {
          title: "My Dear Love",
          path: "beberexha/mydearlove",
        },
        {
          title: "Die For A Man",
          path: "beberexha/dieforaman",
        },
        {
          title: "Baby, I'm Jealous",
          path: "beberexha/babyimjealous",
        },
        {
          title: "On The Go",
          path: "beberexha/onthego",
        },
        {
          title: "Death Row",
          path: "beberexha/deathrow",
        },
        {
          title: "Empty",
          path: "beberexha/empty",
        },
        {
          title: "Amore",
          path: "beberexha/amore",
        },
        {
          title: "Mama",
          path: "beberexha/mama",
        },
      ],
      coverPhotoURL:
        "https://www.azlyrics.com/images/albums/958/9dc4ae7949e7befaa371999237503851.jpg",
    },
    {
      name: "Bebe",
      songs: [
        {
          title: "Heart Wants What It Wants",
          path: "beberexha/heartwantswhatitwants",
        },
        {
          title: "Miracle Man",
          path: "beberexha/miracleman",
        },
        {
          title: "Satellite",
          path: "beberexha/satellite",
        },
        {
          title: "When It Rains",
          path: "beberexha/whenitrains",
        },
        {
          title: "Call On Me",
          path: "beberexha/callonme",
        },
        {
          title: "I'm Good (Blue)",
          path: "davidguetta/imgoodblue",
        },
        {
          title: "Visions (Don't Go)",
          path: "beberexha/visionsdontgo",
        },
        {
          title: "I'm Not High, I'm In Love",
          path: "beberexha/imnothighiminlove",
        },
        {
          title: "Blue Moon",
          path: "beberexha/bluemoon",
        },
        {
          title: "Born Again",
          path: "beberexha/bornagain",
        },
        {
          title: "I Am",
          path: "beberexha/iam",
        },
        {
          title: "Seasons",
          path: "beberexha/seasons",
        },
      ],
      coverPhotoURL:
        "https://www.azlyrics.com/images/albums/117/67acb7082b98074fd75964f93cd97226.jpg",
    },
  ],
  otherSongs: [
    {
      title: "10 Minutes",
      path: "beberexha/10minutes",
    },
    {
      title: "24/7",
      path: "beberexha/247",
    },
    {
      title: "American Citizen",
      path: "beberexha/americancitizen",
    },
    {
      title: "Apple",
      path: "beberexha/apple",
    },
    {
      title: "Baby, I'm Jealous (Natti Natasha Remix)",
      path: "beberexha/babyimjealousnattinatasharemix",
    },
    {
      title: "Bad Bitches Don't Cry",
      path: "beberexha/badbitchesdontcry",
    },
    {
      title: "Beautiful Life",
      path: "beberexha/beautifullife",
    },
    {
      title: "Blame It On Christmas",
      path: "beberexha/blameitonchristmas",
    },
    {
      title: "Break My Heart Myself (ITZY Remix)",
      path: "beberexha/breakmyheartmyselfitzyremix",
    },
    {
      title: "Call You Mine",
      path: "chainsmokers/callyoumine",
    },
    {
      title: "Chain My Heart",
      path: "topic/chainmyheart",
    },
    {
      title: "Comeback Kids",
      path: "beberexha/comebackkids",
    },
    {
      title: "Count On Christmas",
      path: "beberexha/countonchristmas",
    },
    {
      title: "Cry Wolf",
      path: "beberexha/crywolf",
    },
    {
      title: "Free Love",
      path: "beberexha/freelove",
    },
    {
      title: "Girl In The Mirror",
      path: "beberexha/girlinthemirror",
    },
    {
      title: "Gone",
      path: "beberexha/gone",
    },
    {
      title: "Heaven",
      path: "beberexha/heaven",
    },
    {
      title: "Home",
      path: "machinegunkelly/home",
    },
    {
      title: "If Only I",
      path: "twofriends/ifonlyi",
    },
    {
      title: "In The Name Of Love",
      path: "martingarrix/inthenameoflove",
    },
    {
      title: "It's You, Not Me (Sabotage)",
      path: "maskedwolf/itsyounotmesabotage",
    },
    {
      title: "Last Hurrah",
      path: "beberexha/lasthurrah",
    },
    {
      title: "Last Hurrah (David Guetta Remix)",
      path: "beberexha/lasthurrahdavidguettaremix",
    },
    {
      title: "Like A Baby",
      path: "beberexha/likeababy",
    },
    {
      title: "Miracle",
      path: "beberexha/miracle",
    },
    {
      title: "Naughty",
      path: "beberexha/naughty",
    },
    {
      title: "No Broken Hearts",
      path: "beberexha/nobrokenhearts",
    },
    {
      title: "Not 20 Anymore",
      path: "beberexha/not20anymore",
    },
    {
      title: "Nothing At All",
      path: "beberexha/nothingatall",
    },
    {
      title: "One In A Million",
      path: "beberexha/oneinamillion",
    },
    {
      title: "Ride Till You Die",
      path: "beberexha/ridetillyoudie",
    },
    {
      title: "Starlight",
      path: "beberexha/starlight",
    },
    {
      title: "Stars",
      path: "pnau/stars",
    },
    {
      title: "Take It Off",
      path: "beberexha/takeitoff",
    },
    {
      title: "The Way I Are (Dance With Somebody) (DallasK Remix)",
      path: "beberexha/thewayiaredancewithsomebodydallaskremix",
    },
    {
      title: "Two Faces",
      path: "beberexha/twofaces",
    },
    {
      title: "You Can't Stop The Girl",
      path: "beberexha/youcantstopthegirl",
    },
  ],
};

export const mockRouter = createTRPCRouter({
  songData: publicProcedure.query(() => mockData),
  searchResults: publicProcedure
    .input(z.object({ query: z.string(), topN: z.number().max(20).default(5) }))
    .query(({ input }) => mockResults.slice(0, input.topN)),
  artistData: publicProcedure.query(() => mockArtistSongList),
});
