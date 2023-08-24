import { JSDOM } from "jsdom";

import { env } from "@/env.mjs";
import { songurl2path } from "@/utils/client";

import { fetchScrape, proxyScrape } from "./scrapers";

export type SongData = {
  path: string;
  title: string;
  artist: string;
  lyrics: string;
  album: string | null;
  coverPhotoURL: string | null;
};

const scrape = env.NODE_ENV === "production" ? proxyScrape : fetchScrape;

export async function fetchSongData(url: string): Promise<SongData> {
  if (
    !/^https:\/\/www\.azlyrics\.com\/lyrics\/([a-z0-9]+\/[a-z0-9]+)\.html$/.test(
      url
    )
  ) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const html = await scrape(url);

  try {
    const songData = parseLyricsPage(html);
    return {
      ...songData,
      path: songurl2path(url),
    };
  } catch (e) {
    console.error(e);
    throw Error(
      `Failed to parse AZLyrics page: ${url}, this song may not exist`
    );
  }
}

function parseLyricsPage(html: string): Omit<SongData, "id" | "path"> {
  const document = new JSDOM(html).window.document;

  // normal lyrics page only has one h1
  if (document.querySelectorAll("h1").length > 1) {
    throw new Error("Multiple h1 elements found");
  }

  const h1 = document.querySelector("h1");
  const title =
    h1?.textContent
      ?.trim?.()
      ?.replaceAll('"', "")
      ?.replace(/ lyrics$/, "") ?? "";

  const artistElement = document.querySelector("h2>a>b");
  const artist = artistElement?.textContent?.replace?.(/ Lyrics$/, "") ?? "";

  // select all div with no class
  const divs = document.querySelectorAll("div:not([class]):not([id])");
  if (divs.length === 0) {
    console.error(html);
    throw new Error("No divs found");
  }
  // find the longest div's text
  const lyricsDiv = Array.from(divs).reduce((prev, curr) => {
    if ((curr.textContent ?? "").length > (prev.textContent ?? "").length) {
      return curr;
    } else {
      return prev;
    }
  });
  const lyrics = (lyricsDiv.textContent ?? "").replaceAll(/\[.*\]/g, "").trim();

  const albumElement = document.querySelector(".songinalbum_title");
  if (albumElement) {
    const album =
      albumElement.querySelector("b")?.textContent?.replaceAll('"', "") ?? "";
    const coverPhotoSrc =
      albumElement.querySelector(".album-image")?.getAttribute("src") ??
      undefined;
    const coverPhoto = coverPhotoSrc
      ? `https://www.azlyrics.com${coverPhotoSrc}`
      : undefined;
    return {
      title,
      artist,
      album,
      coverPhotoURL: coverPhoto ?? null,
      lyrics,
    };
  } else {
    return {
      title,
      artist,
      lyrics,
      album: null,
      coverPhotoURL: null,
    };
  }
}

const mockHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
<meta name="description" content="Bebe Rexha lyrics - 96 song lyrics sorted by album, including &quot;One In A Million&quot;, &quot;Meant To Be&quot;, &quot;I'm A Mess&quot;."> 
<meta name="keywords" content="Bebe Rexha, Bebe Rexha lyrics, discography, albums, songs">
<meta name="robots" content="noarchive">
<title>Bebe Rexha Lyrics</title>

<link rel="canonical" href="https://www.azlyrics.com/b/beberexha.html" />
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
<link rel="stylesheet" href="/local/az.css">

<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
<!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
<![endif]-->
<script type="text/javascript">
window.rtkGPTSlotsTargeting = [
    [
        ["genre", "urban"],
        ["artist", "Bebe Rexha"]
    ]
];
</script>

<!-- Start WKND tag. Deploy at the beginning of document head. -->
<!-- Tag for Bandsintown | AZ Lyrics (azlyrics.com) -->
<script>
	(function(d) {
		var e = d.createElement('script');
		e.src = d.location.protocol + '//tag.wknd.ai/6284/i.js';
		e.async = true;
		d.getElementsByTagName("head")[0].appendChild(e);
	}(document));
</script>
<!-- End WKND tag -->

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-7DQK0JTQTQ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-7DQK0JTQTQ');
</script>

<script src="https://cookie-cdn.cookiepro.com/scripttemplates/otSDKStub.js" data-language="en" type="text/javascript" charset="UTF-8" data-domain-script="464b7175-7273-4e0f-8753-e9a483d4a156" ></script>
<script type="text/javascript">
function OptanonWrapper() { }
</script>

<script type="text/javascript">
ArtistName = "Bebe Rexha";
</script>

<link rel="stylesheet" href="https://a.pub.network/core/pubfig/cls.css">
<script data-cfasync="false" type="text/javascript">
  var freestar = freestar || {};
  freestar.queue = freestar.queue || [];
  freestar.config = freestar.config || {};
  freestar.config.enabled_slots = [];
  freestar.initCallback = function () { (freestar.config.enabled_slots.length === 0) ? freestar.initCallbackCalled = false : freestar.newAdSlots(freestar.config.enabled_slots) }
</script>
<script src="https://a.pub.network/azlyrics-com/pubfig.min.js" async></script>
</head>
<body class="margin50">
  <nav class="navbar navbar-default navbar-fixed-top">
  <div class="container">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#search-collapse">
        <span class="glyphicon glyphicon-search"></span>
      </button>
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#artists-collapse">
        <span class="glyphicon glyphicon-th-list"></span>
      </button>
      <a class="navbar-brand" href="//www.azlyrics.com"><img alt="AZLyrics.com" class="pull-left" style="max-height:40px; margin-top:-10px;" src="//www.azlyrics.com/az_logo_tr.png"></a>
    </div>
    <ul class="collapse navbar-collapse nav navbar-nav" id="artists-collapse">
    <li>
    <div class="btn-group text-center" role="group">
    <a class="btn btn-menu" href="//www.azlyrics.com/a.html">A</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/b.html">B</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/c.html">C</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/d.html">D</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/e.html">E</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/f.html">F</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/g.html">G</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/h.html">H</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/i.html">I</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/j.html">J</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/k.html">K</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/l.html">L</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/m.html">M</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/n.html">N</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/o.html">O</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/p.html">P</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/q.html">Q</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/r.html">R</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/s.html">S</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/t.html">T</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/u.html">U</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/v.html">V</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/w.html">W</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/x.html">X</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/y.html">Y</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/z.html">Z</a>
    <a class="btn btn-menu" href="//www.azlyrics.com/19.html">#</a>
    </div>
    </li>
    </ul>

    <div class="collapse navbar-collapse" id="search-collapse">

        <form class="navbar-form navbar-right search" method="get" action="//search.azlyrics.com/search.php" role="search">
         <div class="input-group">  
		<input type="text" class="form-control" placeholder="" name="q" id="q">
       		<span class="input-group-btn">
            	  <button class="btn btn-primary" type="submit"><span class="glyphicon glyphicon-search"></span> Search</button>
          	</span>
 	  </div>   
	</form>

    </div><!-- /.navbar-collapse -->
    </div><!-- /.container -->
  </nav>

<!-- top ban -->
  <div class="lboard-wrap">
  <div class="container">
    <div class="row">
       <div class="top-ad text-center">
            <div id="primisPlayer"></div>
       </div>
    </div>
  </div>
  </div>

<!-- main -->
<div class="container main-page">
<div class="text-center noprint">
<!-- Tag ID: azlyrics_atf_leaderboard -->
    <div align="center" data-freestar-ad="__320x50 __728x90" id="azlyrics_atf_leaderboard">
      <script data-cfasync="false" type="text/javascript">
        freestar.config.enabled_slots.push({ placementName: "azlyrics_atf_leaderboard", slotId: "azlyrics_atf_leaderboard" });
      </script>
    </div>
</div>
<div class="row">
<div class="col-lg-2 text-center hidden-md hidden-sm hidden-xs">
   <div class="sky-ad"></div>
</div>

<!-- content -->
<div class="col-xs-12 col-lg-8 text-center">

<form id="addsong" action="../add.php" method="post">
<input type="hidden" name="what" value="add_song">
<input type="hidden" name="artist" value="Bebe Rexha">
<input type="hidden" name="artist_id" value="5895">
</form>

<div class="div-share noprint" style="padding-bottom:20px;">
<div class="addthis_toolbox addthis_default_style">
<a href="https://www.facebook.com/sharer.php?u=https%3A%2F%2Fwww.azlyrics.com%2Fb%2Fbeberexha.html&amp;title=Bebe%20Rexha%20Lyrics&amp;display=page" target="_blank" class="btn btn-xs btn-share addthis_button_facebook">
<span class="playblk"><img src="//www.azlyrics.com/images/share-icons/facebook.svg" width="25" height="25" class="playblk" alt="Share on Facebook" title="Share on Facebook"></span>
</a>
<a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.azlyrics.com%2Fb%2Fbeberexha.html&amp;text=Bebe%20Rexha%20Lyrics" target="_blank" class="btn btn-xs btn-share addthis_button_twitter">
<span class="playblk"><img src="//www.azlyrics.com/images/share-icons/twitter.svg" width="25" height="25" class="playblk" alt="Share on Twitter" title="Share on Twitter"></span>
</a>
<a href="mailto:?subject=Bebe%20Rexha%20Lyrics&amp;body=https%3A%2F%2Fwww.azlyrics.com%2Fb%2Fbeberexha.html" target="_blank" class="btn btn-xs btn-share addthis_button_email">
<span class="playblk"><img src="//www.azlyrics.com/images/share-icons/email.svg" width="25" height="25" class="playblk" alt="Email" title="Email"></span>
</a>
</div>
</div>

<div class="middle-ad">
</div>

<h1><strong>Bebe Rexha Lyrics</strong></h1>

<div class="ringtone">
<span id="cf_text_top"></span>
</div>


<!-- start of song list -->
<a id="az_sort_album" class="btn btn-xs btn-default sorting"><span class="glyphicon glyphicon-sort-by-order"></span> sort by album</a><a id="az_sort_song" class="btn btn-xs btn-default sorting"><span class="glyphicon glyphicon-sort-by-alphabet"></span> sort by song</a><br>
<div id="listAlbum">
<div id="38111" class="album">EP: <b>"I Don't Wanna Grow Up"</b> (2015)<div><img src="/images/albums/381/dc121f8f2f85bfc9f2f778117c25484e.jpg" class="album-image" alt="Bebe Rexha - I Don't Wanna Grow Up EP cover" /></div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/idontwannagrowup.html" target="_blank">I Don't Wanna Grow Up</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/sweetbeginnings.html" target="_blank">Sweet Beginnings</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/imgonnashowyoucrazy.html" target="_blank">I'm Gonna Show You Crazy</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/pray.html" target="_blank">Pray</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/icantstopdrinkingaboutyou.html" target="_blank">I Can't Stop Drinking About You</a></div>

<div id="44892" class="album">EP: <b>"All Your Fault: Pt 1"</b> (2017)<div><img src="/images/albums/448/dd798324c37cb9e3400b737668f247fb.jpg" class="album-image" alt="Bebe Rexha - All Your Fault: Pt 1 EP cover" /></div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/atmosphere.html" target="_blank">Atmosphere</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/igotyou.html" target="_blank">I Got You</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/smalldoses.html" target="_blank">Small Doses</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/fuckfakefriends.html" target="_blank">F.F.F. (Fuck Fake Friends)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/gatewaydrug.html" target="_blank">Gateway Drug</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/badbitch.html" target="_blank">Bad Bitch</a></div>

<div id="49393" class="album">EP: <b>"All Your Fault: Pt 2"</b> (2017)<div><img src="/images/albums/493/305772ade163408d9babff8bf23d009d.jpg" class="album-image" alt="Bebe Rexha - All Your Fault: Pt 2 EP cover" /></div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/thatsit.html" target="_blank">That's It</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/igottime.html" target="_blank">I Got Time</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/dancewithsomebody.html" target="_blank">The Way I Are (Dance With Somebody)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/nottheone.html" target="_blank">(Not) The One</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/comfortable.html" target="_blank">Comfortable</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/meanttobe.html" target="_blank">Meant To Be</a></div>

<div id="56108" class="album">album: <b>"Expectations"</b> (2018)<div><img src="/images/albums/561/b2fcf454cad87b757efbee7152b4a7a3.jpg" class="album-image" alt="Bebe Rexha - Expectations album cover" /></div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/ferrari.html" target="_blank">Ferrari</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/imamess.html" target="_blank">I'm A Mess</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/2soulsonfire.html" target="_blank">2 Souls On Fire</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/shiningstar.html" target="_blank">Shining Star</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/knees.html" target="_blank">Knees</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/igotyou.html" target="_blank">I Got You</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/selfcontrol.html" target="_blank">Self Control</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/sad.html" target="_blank">Sad</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/mine.html" target="_blank">Mine</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/steady.html" target="_blank">Steady</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/dontgetanycloser.html" target="_blank">Don't Get Any Closer</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/grace.html" target="_blank">Grace</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/pillow.html" target="_blank">Pillow</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/meanttobe.html" target="_blank">Meant To Be</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/icantstopdrinkingaboutyouchainsmokersremix.html" target="_blank">I Can't Stop Drinking About You (Chainsmokers Remix)</a><div class="comment">(Japanese Bonus Track)</div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/igotyoucheatcodesremix.html" target="_blank">I Got You (Cheat Codes Remix)</a><div class="comment">(Japanese Bonus Track)</div></div>

<div id="95837" class="album">album: <b>"Better Mistakes"</b> (2021)<div><img src="/images/albums/958/9dc4ae7949e7befaa371999237503851.jpg" class="album-image" alt="Bebe Rexha - Better Mistakes album cover" /></div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/breakmyheartmyself.html" target="_blank">Break My Heart Myself</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/sabotage.html" target="_blank">Sabotage</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/trustfall.html" target="_blank">Trust Fall</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/bettermistakes.html" target="_blank">Better Mistakes</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/sacrifice.html" target="_blank">Sacrifice</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/mydearlove.html" target="_blank">My Dear Love</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/dieforaman.html" target="_blank">Die For A Man</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/babyimjealous.html" target="_blank">Baby, I'm Jealous</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/onthego.html" target="_blank">On The Go</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/deathrow.html" target="_blank">Death Row</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/empty.html" target="_blank">Empty</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/amore.html" target="_blank">Amore</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/mama.html" target="_blank">Mama</a></div>

<br>
<!-- Tag ID: azlyrics_incontent_1 -->
<div align="center" data-freestar-ad="__320x50 __728x90" id="azlyrics_incontent_1">
  <script data-cfasync="false" type="text/javascript">
    freestar.config.enabled_slots.push({ placementName: "azlyrics_incontent_1", slotId: "azlyrics_incontent_1" });
  </script>
</div>
<div id="117561" class="album">album: <b>"Bebe"</b> (2023)<div><img src="/images/albums/117/67acb7082b98074fd75964f93cd97226.jpg" class="album-image" alt="Bebe Rexha - Bebe album cover" /></div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/heartwantswhatitwants.html" target="_blank">Heart Wants What It Wants</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/miracleman.html" target="_blank">Miracle Man</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/satellite.html" target="_blank">Satellite</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/whenitrains.html" target="_blank">When It Rains</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/callonme.html" target="_blank">Call On Me</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/davidguetta/imgoodblue.html" target="_blank">I'm Good (Blue)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/visionsdontgo.html" target="_blank">Visions (Don't Go)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/imnothighiminlove.html" target="_blank">I'm Not High, I'm In Love</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/bluemoon.html" target="_blank">Blue Moon</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/bornagain.html" target="_blank">Born Again</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/iam.html" target="_blank">I Am</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/seasons.html" target="_blank">Seasons</a></div>

<div class="album"><b>other songs:</b></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/10minutes.html" target="_blank">10 Minutes</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/247.html" target="_blank">24/7</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/americancitizen.html" target="_blank">American Citizen</a><div class="comment">(from &quot;We The People&quot; soundtrack)</div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/apple.html" target="_blank">Apple</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/babyimjealousnattinatasharemix.html" target="_blank">Baby, I'm Jealous (Natti Natasha Remix)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/badbitchesdontcry.html" target="_blank">Bad Bitches Don't Cry</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/beautifullife.html" target="_blank">Beautiful Life</a><div class="comment">(from &quot;Abominable&quot; soundtrack)</div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/blameitonchristmas.html" target="_blank">Blame It On Christmas</a><div class="comment">(from &quot;Happiest Season&quot; soundtrack)</div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/breakmyheartmyselfitzyremix.html" target="_blank">Break My Heart Myself (ITZY Remix)</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/chainsmokers/callyoumine.html" target="_blank">Call You Mine</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/topic/chainmyheart.html" target="_blank">Chain My Heart</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/comebackkids.html" target="_blank">Comeback Kids</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/countonchristmas.html" target="_blank">Count On Christmas</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/crywolf.html" target="_blank">Cry Wolf</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/freelove.html" target="_blank">Free Love</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/girlinthemirror.html" target="_blank">Girl In The Mirror</a><div class="comment">(from &quot;UglyDolls&quot; soundtrack)</div></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/gone.html" target="_blank">Gone</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/heaven.html" target="_blank">Heaven</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/machinegunkelly/home.html" target="_blank">Home</a><div class="comment">(from &quot;Bright&quot; soundtrack)</div></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/twofriends/ifonlyi.html" target="_blank">If Only I</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/martingarrix/inthenameoflove.html" target="_blank">In The Name Of Love</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/maskedwolf/itsyounotmesabotage.html" target="_blank">It's You, Not Me (Sabotage)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/lasthurrah.html" target="_blank">Last Hurrah</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/lasthurrahdavidguettaremix.html" target="_blank">Last Hurrah (David Guetta Remix)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/likeababy.html" target="_blank">Like A Baby</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/miracle.html" target="_blank">Miracle</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/naughty.html" target="_blank">Naughty</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/nobrokenhearts.html" target="_blank">No Broken Hearts</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/not20anymore.html" target="_blank">Not 20 Anymore</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/nothingatall.html" target="_blank">Nothing At All</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/oneinamillion.html" target="_blank">One In A Million</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/ridetillyoudie.html" target="_blank">Ride Till You Die</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/starlight.html" target="_blank">Starlight</a></div>
<div class="listalbum-item"><a href="https://www.azlyrics.com/lyrics/pnau/stars.html" target="_blank">Stars</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/takeitoff.html" target="_blank">Take It Off</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/thewayiaredancewithsomebodydallaskremix.html" target="_blank">The Way I Are (Dance With Somebody) (DallasK Remix)</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/twofaces.html" target="_blank">Two Faces</a></div>
<div class="listalbum-item"><a href="/lyrics/beberexha/youcantstopthegirl.html" target="_blank">You Can't Stop The Girl</a><div class="comment">(from &quot;Maleficent: Mistress of Evil&quot; soundtrack)</div></div>

<script type="text/javascript">
<!--
var songlist = [
{s:"(Not) The One", h:"/lyrics/beberexha/nottheone.html", c:"", a:"", link_class:''},
{s:"10 Minutes", h:"/lyrics/beberexha/10minutes.html", c:"", a:"", link_class:''},
{s:"2 Souls On Fire", h:"/lyrics/beberexha/2soulsonfire.html", c:"", a:"", link_class:''},
{s:"24/7", h:"/lyrics/beberexha/247.html", c:"", a:"", link_class:''},
{s:"American Citizen", h:"/lyrics/beberexha/americancitizen.html", c:"", a:"", link_class:''},
{s:"Amore", h:"/lyrics/beberexha/amore.html", c:"", a:"", link_class:''},
{s:"Apple", h:"/lyrics/beberexha/apple.html", c:"", a:"", link_class:''},
{s:"Atmosphere", h:"/lyrics/beberexha/atmosphere.html", c:"", a:"", link_class:''},
{s:"Baby, I'm Jealous", h:"/lyrics/beberexha/babyimjealous.html", c:"", a:"", link_class:''},
{s:"Baby, I'm Jealous (Natti Natasha Remix)", h:"/lyrics/beberexha/babyimjealousnattinatasharemix.html", c:"", a:"", link_class:''},
{s:"Bad Bitch", h:"/lyrics/beberexha/badbitch.html", c:"", a:"", link_class:''},
{s:"Bad Bitches Don't Cry", h:"/lyrics/beberexha/badbitchesdontcry.html", c:"", a:"", link_class:''},
{s:"Beautiful Life", h:"/lyrics/beberexha/beautifullife.html", c:"", a:"", link_class:''},
{s:"Better Mistakes", h:"/lyrics/beberexha/bettermistakes.html", c:"", a:"", link_class:''},
{s:"Blame It On Christmas", h:"/lyrics/beberexha/blameitonchristmas.html", c:"", a:"", link_class:''},
{s:"Blue Moon", h:"/lyrics/beberexha/bluemoon.html", c:"", a:"", link_class:''},
{s:"Born Again", h:"/lyrics/beberexha/bornagain.html", c:"", a:"", link_class:''},
{s:"Break My Heart Myself", h:"/lyrics/beberexha/breakmyheartmyself.html", c:"", a:"", link_class:''},
{s:"Break My Heart Myself (ITZY Remix)", h:"/lyrics/beberexha/breakmyheartmyselfitzyremix.html", c:"", a:"", link_class:''},
{s:"Call On Me", h:"/lyrics/beberexha/callonme.html", c:"", a:"", link_class:''},
{s:"Call You Mine", h:"https://www.azlyrics.com/lyrics/chainsmokers/callyoumine.html", c:"", a:"", link_class:''},
{s:"Chain My Heart", h:"https://www.azlyrics.com/lyrics/topic/chainmyheart.html", c:"", a:"", link_class:''},
{s:"Comeback Kids", h:"/lyrics/beberexha/comebackkids.html", c:"", a:"", link_class:''},
{s:"Comfortable", h:"/lyrics/beberexha/comfortable.html", c:"", a:"", link_class:''},
{s:"Count On Christmas", h:"/lyrics/beberexha/countonchristmas.html", c:"", a:"", link_class:''},
{s:"Cry Wolf", h:"/lyrics/beberexha/crywolf.html", c:"", a:"", link_class:''},
{s:"Death Row", h:"/lyrics/beberexha/deathrow.html", c:"", a:"", link_class:''},
{s:"Die For A Man", h:"/lyrics/beberexha/dieforaman.html", c:"", a:"", link_class:''},
{s:"Don't Get Any Closer", h:"/lyrics/beberexha/dontgetanycloser.html", c:"", a:"", link_class:''},
{s:"Empty", h:"/lyrics/beberexha/empty.html", c:"", a:"", link_class:''},
{s:"F.F.F. (Fuck Fake Friends)", h:"/lyrics/beberexha/fuckfakefriends.html", c:"", a:"", link_class:''},
{s:"Ferrari", h:"/lyrics/beberexha/ferrari.html", c:"", a:"", link_class:''},
{s:"Free Love", h:"/lyrics/beberexha/freelove.html", c:"", a:"", link_class:''},
{s:"Gateway Drug", h:"/lyrics/beberexha/gatewaydrug.html", c:"", a:"", link_class:''},
{s:"Girl In The Mirror", h:"/lyrics/beberexha/girlinthemirror.html", c:"", a:"", link_class:''},
{s:"Gone", h:"/lyrics/beberexha/gone.html", c:"", a:"", link_class:''},
{s:"Grace", h:"/lyrics/beberexha/grace.html", c:"", a:"", link_class:''},
{s:"Heart Wants What It Wants", h:"/lyrics/beberexha/heartwantswhatitwants.html", c:"", a:"", link_class:''},
{s:"Heaven", h:"/lyrics/beberexha/heaven.html", c:"", a:"", link_class:''},
{s:"Home", h:"https://www.azlyrics.com/lyrics/machinegunkelly/home.html", c:"", a:"", link_class:''},
{s:"I Am", h:"/lyrics/beberexha/iam.html", c:"", a:"", link_class:''},
{s:"I Can't Stop Drinking About You", h:"/lyrics/beberexha/icantstopdrinkingaboutyou.html", c:"", a:"", link_class:''},
{s:"I Can't Stop Drinking About You (Chainsmokers Remix)", h:"/lyrics/beberexha/icantstopdrinkingaboutyouchainsmokersremix.html", c:"", a:"", link_class:''},
{s:"I Don't Wanna Grow Up", h:"/lyrics/beberexha/idontwannagrowup.html", c:"", a:"", link_class:''},
{s:"I Got Time", h:"/lyrics/beberexha/igottime.html", c:"", a:"", link_class:''},
{s:"I Got You", h:"/lyrics/beberexha/igotyou.html", c:"", a:"", link_class:''},
{s:"I Got You (Cheat Codes Remix)", h:"/lyrics/beberexha/igotyoucheatcodesremix.html", c:"", a:"", link_class:''},
{s:"I'm A Mess", h:"/lyrics/beberexha/imamess.html", c:"", a:"", link_class:''},
{s:"I'm Gonna Show You Crazy", h:"/lyrics/beberexha/imgonnashowyoucrazy.html", c:"", a:"", link_class:''},
{s:"I'm Good (Blue)", h:"https://www.azlyrics.com/lyrics/davidguetta/imgoodblue.html", c:"", a:"", link_class:''},
{s:"I'm Not High, I'm In Love", h:"/lyrics/beberexha/imnothighiminlove.html", c:"", a:"", link_class:''},
{s:"If Only I", h:"https://www.azlyrics.com/lyrics/twofriends/ifonlyi.html", c:"", a:"", link_class:''},
{s:"In The Name Of Love", h:"https://www.azlyrics.com/lyrics/martingarrix/inthenameoflove.html", c:"", a:"", link_class:''},
{s:"It's You, Not Me (Sabotage)", h:"https://www.azlyrics.com/lyrics/maskedwolf/itsyounotmesabotage.html", c:"", a:"", link_class:''},
{s:"Knees", h:"/lyrics/beberexha/knees.html", c:"", a:"", link_class:''},
{s:"Last Hurrah", h:"/lyrics/beberexha/lasthurrah.html", c:"", a:"", link_class:''},
{s:"Last Hurrah (David Guetta Remix)", h:"/lyrics/beberexha/lasthurrahdavidguettaremix.html", c:"", a:"", link_class:''},
{s:"Like A Baby", h:"/lyrics/beberexha/likeababy.html", c:"", a:"", link_class:''},
{s:"Mama", h:"/lyrics/beberexha/mama.html", c:"", a:"", link_class:''},
{s:"Meant To Be", h:"/lyrics/beberexha/meanttobe.html", c:"", a:"", link_class:''},
{s:"Mine", h:"/lyrics/beberexha/mine.html", c:"", a:"", link_class:''},
{s:"Miracle", h:"/lyrics/beberexha/miracle.html", c:"", a:"", link_class:''},
{s:"Miracle Man", h:"/lyrics/beberexha/miracleman.html", c:"", a:"", link_class:''},
{s:"My Dear Love", h:"/lyrics/beberexha/mydearlove.html", c:"", a:"", link_class:''},
{s:"Naughty", h:"/lyrics/beberexha/naughty.html", c:"", a:"", link_class:''},
{s:"No Broken Hearts", h:"/lyrics/beberexha/nobrokenhearts.html", c:"", a:"", link_class:''},
{s:"Not 20 Anymore", h:"/lyrics/beberexha/not20anymore.html", c:"", a:"", link_class:''},
{s:"Nothing At All", h:"/lyrics/beberexha/nothingatall.html", c:"", a:"", link_class:''},
{s:"On The Go", h:"/lyrics/beberexha/onthego.html", c:"", a:"", link_class:''},
{s:"One In A Million", h:"/lyrics/beberexha/oneinamillion.html", c:"", a:"", link_class:''},
{s:"Pillow", h:"/lyrics/beberexha/pillow.html", c:"", a:"", link_class:''},
{s:"Pray", h:"/lyrics/beberexha/pray.html", c:"", a:"", link_class:''},
{s:"Ride Till You Die", h:"/lyrics/beberexha/ridetillyoudie.html", c:"", a:"", link_class:''},
{s:"Sabotage", h:"/lyrics/beberexha/sabotage.html", c:"", a:"", link_class:''},
{s:"Sacrifice", h:"/lyrics/beberexha/sacrifice.html", c:"", a:"", link_class:''},
{s:"Sad", h:"/lyrics/beberexha/sad.html", c:"", a:"", link_class:''},
{s:"Satellite", h:"/lyrics/beberexha/satellite.html", c:"", a:"", link_class:''},
{s:"Seasons", h:"/lyrics/beberexha/seasons.html", c:"", a:"", link_class:''},
{s:"Self Control", h:"/lyrics/beberexha/selfcontrol.html", c:"", a:"", link_class:''},
{s:"Shining Star", h:"/lyrics/beberexha/shiningstar.html", c:"", a:"", link_class:''},
{s:"Small Doses", h:"/lyrics/beberexha/smalldoses.html", c:"", a:"", link_class:''},
{s:"Starlight", h:"/lyrics/beberexha/starlight.html", c:"", a:"", link_class:''},
{s:"Stars", h:"https://www.azlyrics.com/lyrics/pnau/stars.html", c:"", a:"", link_class:''},
{s:"Steady", h:"/lyrics/beberexha/steady.html", c:"", a:"", link_class:''},
{s:"Sweet Beginnings", h:"/lyrics/beberexha/sweetbeginnings.html", c:"", a:"", link_class:''},
{s:"Take It Off", h:"/lyrics/beberexha/takeitoff.html", c:"", a:"", link_class:''},
{s:"That's It", h:"/lyrics/beberexha/thatsit.html", c:"", a:"", link_class:''},
{s:"The Way I Are (Dance With Somebody)", h:"/lyrics/beberexha/dancewithsomebody.html", c:"", a:"", link_class:''},
{s:"The Way I Are (Dance With Somebody) (DallasK Remix)", h:"/lyrics/beberexha/thewayiaredancewithsomebodydallaskremix.html", c:"", a:"", link_class:''},
{s:"Trust Fall", h:"/lyrics/beberexha/trustfall.html", c:"", a:"", link_class:''},
{s:"Two Faces", h:"/lyrics/beberexha/twofaces.html", c:"", a:"", link_class:''},
{s:"Visions (Don't Go)", h:"/lyrics/beberexha/visionsdontgo.html", c:"", a:"", link_class:''},
{s:"When It Rains", h:"/lyrics/beberexha/whenitrains.html", c:"", a:"", link_class:''},
{s:"You Can't Stop The Girl", h:"/lyrics/beberexha/youcantstopthegirl.html", c:"", a:"", link_class:''}];
var albumlist = ["<div id=\"38111\" class=\"album\">EP: <b>\"I Don't Wanna Grow Up\"<\/b> (2015)<div><img src=\"\/images\/albums\/381\/dc121f8f2f85bfc9f2f778117c25484e.jpg\" class=\"album-image\" alt=\"Bebe Rexha - I Don't Wanna Grow Up EP cover\" \/><\/div><\/div>\r\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/idontwannagrowup.html\" target=\"_blank\">I Don't Wanna Grow Up<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/sweetbeginnings.html\" target=\"_blank\">Sweet Beginnings<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/imgonnashowyoucrazy.html\" target=\"_blank\">I'm Gonna Show You Crazy<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/pray.html\" target=\"_blank\">Pray<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/icantstopdrinkingaboutyou.html\" target=\"_blank\">I Can't Stop Drinking About You<\/a><\/div>\n\r\n","<div id=\"44892\" class=\"album\">EP: <b>\"All Your Fault: Pt 1\"<\/b> (2017)<div><img src=\"\/images\/albums\/448\/dd798324c37cb9e3400b737668f247fb.jpg\" class=\"album-image\" alt=\"Bebe Rexha - All Your Fault: Pt 1 EP cover\" \/><\/div><\/div>\r\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/atmosphere.html\" target=\"_blank\">Atmosphere<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/igotyou.html\" target=\"_blank\">I Got You<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/smalldoses.html\" target=\"_blank\">Small Doses<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/fuckfakefriends.html\" target=\"_blank\">F.F.F. (Fuck Fake Friends)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/gatewaydrug.html\" target=\"_blank\">Gateway Drug<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/badbitch.html\" target=\"_blank\">Bad Bitch<\/a><\/div>\n\r\n","<div id=\"49393\" class=\"album\">EP: <b>\"All Your Fault: Pt 2\"<\/b> (2017)<div><img src=\"\/images\/albums\/493\/305772ade163408d9babff8bf23d009d.jpg\" class=\"album-image\" alt=\"Bebe Rexha - All Your Fault: Pt 2 EP cover\" \/><\/div><\/div>\r\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/thatsit.html\" target=\"_blank\">That's It<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/igottime.html\" target=\"_blank\">I Got Time<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/dancewithsomebody.html\" target=\"_blank\">The Way I Are (Dance With Somebody)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/nottheone.html\" target=\"_blank\">(Not) The One<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/comfortable.html\" target=\"_blank\">Comfortable<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/meanttobe.html\" target=\"_blank\">Meant To Be<\/a><\/div>\n\r\n","<div id=\"56108\" class=\"album\">album: <b>\"Expectations\"<\/b> (2018)<div><img src=\"\/images\/albums\/561\/b2fcf454cad87b757efbee7152b4a7a3.jpg\" class=\"album-image\" alt=\"Bebe Rexha - Expectations album cover\" \/><\/div><\/div>\r\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/ferrari.html\" target=\"_blank\">Ferrari<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/imamess.html\" target=\"_blank\">I'm A Mess<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/2soulsonfire.html\" target=\"_blank\">2 Souls On Fire<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/shiningstar.html\" target=\"_blank\">Shining Star<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/knees.html\" target=\"_blank\">Knees<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/igotyou.html\" target=\"_blank\">I Got You<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/selfcontrol.html\" target=\"_blank\">Self Control<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/sad.html\" target=\"_blank\">Sad<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/mine.html\" target=\"_blank\">Mine<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/steady.html\" target=\"_blank\">Steady<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/dontgetanycloser.html\" target=\"_blank\">Don't Get Any Closer<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/grace.html\" target=\"_blank\">Grace<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/pillow.html\" target=\"_blank\">Pillow<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/meanttobe.html\" target=\"_blank\">Meant To Be<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/icantstopdrinkingaboutyouchainsmokersremix.html\" target=\"_blank\">I Can't Stop Drinking About You (Chainsmokers Remix)<\/a><div class=\"comment\">(Japanese Bonus Track)<\/div><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/igotyoucheatcodesremix.html\" target=\"_blank\">I Got You (Cheat Codes Remix)<\/a><div class=\"comment\">(Japanese Bonus Track)<\/div><\/div>\n\r\n","<div id=\"95837\" class=\"album\">album: <b>\"Better Mistakes\"<\/b> (2021)<div><img src=\"\/images\/albums\/958\/9dc4ae7949e7befaa371999237503851.jpg\" class=\"album-image\" alt=\"Bebe Rexha - Better Mistakes album cover\" \/><\/div><\/div>\r\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/breakmyheartmyself.html\" target=\"_blank\">Break My Heart Myself<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/sabotage.html\" target=\"_blank\">Sabotage<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/trustfall.html\" target=\"_blank\">Trust Fall<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/bettermistakes.html\" target=\"_blank\">Better Mistakes<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/sacrifice.html\" target=\"_blank\">Sacrifice<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/mydearlove.html\" target=\"_blank\">My Dear Love<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/dieforaman.html\" target=\"_blank\">Die For A Man<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/babyimjealous.html\" target=\"_blank\">Baby, I'm Jealous<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/onthego.html\" target=\"_blank\">On The Go<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/deathrow.html\" target=\"_blank\">Death Row<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/empty.html\" target=\"_blank\">Empty<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/amore.html\" target=\"_blank\">Amore<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/mama.html\" target=\"_blank\">Mama<\/a><\/div>\n\r\n","<div id=\"117561\" class=\"album\">album: <b>\"Bebe\"<\/b> (2023)<div><img src=\"\/images\/albums\/117\/67acb7082b98074fd75964f93cd97226.jpg\" class=\"album-image\" alt=\"Bebe Rexha - Bebe album cover\" \/><\/div><\/div>\r\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/heartwantswhatitwants.html\" target=\"_blank\">Heart Wants What It Wants<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/miracleman.html\" target=\"_blank\">Miracle Man<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/satellite.html\" target=\"_blank\">Satellite<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/whenitrains.html\" target=\"_blank\">When It Rains<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/callonme.html\" target=\"_blank\">Call On Me<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/davidguetta\/imgoodblue.html\" target=\"_blank\">I'm Good (Blue)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/visionsdontgo.html\" target=\"_blank\">Visions (Don't Go)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/imnothighiminlove.html\" target=\"_blank\">I'm Not High, I'm In Love<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/bluemoon.html\" target=\"_blank\">Blue Moon<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/bornagain.html\" target=\"_blank\">Born Again<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/iam.html\" target=\"_blank\">I Am<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/seasons.html\" target=\"_blank\">Seasons<\/a><\/div>\n\r\n"];
var albumlist_others = "<div class=\"album\"><b>other songs:<\/b><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/10minutes.html\" target=\"_blank\">10 Minutes<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/247.html\" target=\"_blank\">24\/7<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/americancitizen.html\" target=\"_blank\">American Citizen<\/a><div class=\"comment\">(from &quot;We The People&quot; soundtrack)<\/div><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/apple.html\" target=\"_blank\">Apple<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/babyimjealousnattinatasharemix.html\" target=\"_blank\">Baby, I'm Jealous (Natti Natasha Remix)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/badbitchesdontcry.html\" target=\"_blank\">Bad Bitches Don't Cry<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/beautifullife.html\" target=\"_blank\">Beautiful Life<\/a><div class=\"comment\">(from &quot;Abominable&quot; soundtrack)<\/div><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/blameitonchristmas.html\" target=\"_blank\">Blame It On Christmas<\/a><div class=\"comment\">(from &quot;Happiest Season&quot; soundtrack)<\/div><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/breakmyheartmyselfitzyremix.html\" target=\"_blank\">Break My Heart Myself (ITZY Remix)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/chainsmokers\/callyoumine.html\" target=\"_blank\">Call You Mine<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/topic\/chainmyheart.html\" target=\"_blank\">Chain My Heart<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/comebackkids.html\" target=\"_blank\">Comeback Kids<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/countonchristmas.html\" target=\"_blank\">Count On Christmas<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/crywolf.html\" target=\"_blank\">Cry Wolf<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/freelove.html\" target=\"_blank\">Free Love<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/girlinthemirror.html\" target=\"_blank\">Girl In The Mirror<\/a><div class=\"comment\">(from &quot;UglyDolls&quot; soundtrack)<\/div><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/gone.html\" target=\"_blank\">Gone<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/heaven.html\" target=\"_blank\">Heaven<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/machinegunkelly\/home.html\" target=\"_blank\">Home<\/a><div class=\"comment\">(from &quot;Bright&quot; soundtrack)<\/div><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/twofriends\/ifonlyi.html\" target=\"_blank\">If Only I<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/martingarrix\/inthenameoflove.html\" target=\"_blank\">In The Name Of Love<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/maskedwolf\/itsyounotmesabotage.html\" target=\"_blank\">It's You, Not Me (Sabotage)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/lasthurrah.html\" target=\"_blank\">Last Hurrah<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/lasthurrahdavidguettaremix.html\" target=\"_blank\">Last Hurrah (David Guetta Remix)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/likeababy.html\" target=\"_blank\">Like A Baby<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/miracle.html\" target=\"_blank\">Miracle<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/naughty.html\" target=\"_blank\">Naughty<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/nobrokenhearts.html\" target=\"_blank\">No Broken Hearts<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/not20anymore.html\" target=\"_blank\">Not 20 Anymore<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/nothingatall.html\" target=\"_blank\">Nothing At All<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/oneinamillion.html\" target=\"_blank\">One In A Million<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/ridetillyoudie.html\" target=\"_blank\">Ride Till You Die<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/starlight.html\" target=\"_blank\">Starlight<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"https:\/\/www.azlyrics.com\/lyrics\/pnau\/stars.html\" target=\"_blank\">Stars<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/takeitoff.html\" target=\"_blank\">Take It Off<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/thewayiaredancewithsomebodydallaskremix.html\" target=\"_blank\">The Way I Are (Dance With Somebody) (DallasK Remix)<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/twofaces.html\" target=\"_blank\">Two Faces<\/a><\/div>\n<div class=\"listalbum-item\"><a href=\"\/lyrics\/beberexha\/youcantstopthegirl.html\" target=\"_blank\">You Can't Stop The Girl<\/a><div class=\"comment\">(from &quot;Maleficent: Mistress of Evil&quot; soundtrack)<\/div><\/div>\n\n";

window.addEventListener('DOMContentLoaded', function(){

$('#az_sort_song').on('click',function(event){
    var sortprop='data-az-song-sort';
    var el = event.currentTarget;
    var el_glyph = $(el).children('span.glyphicon');
    var res='';
    if(el.getAttribute(sortprop)){
        el.setAttribute(sortprop,'');
        el_glyph.removeClass('glyphicon-sort-by-alphabet');
        el_glyph.addClass('glyphicon-sort-by-alphabet-alt');
        for (var i=(songlist.length-1); i>=0; i--) {
            res += '<div class="listalbum-item"><a href="'+songlist[i].h+'" target="_blank"'+songlist[i].link_class +'>'+songlist[i].s+''+songlist[i].c+'</a>'+(songlist[i].a=="" ? '' : ' <div class="comment">('+songlist[i].a+')</div>')+'</div>';
        }
    }else{
        el.setAttribute(sortprop,'1');
        el_glyph.removeClass('glyphicon-sort-by-alphabet-alt');
        el_glyph.addClass('glyphicon-sort-by-alphabet');
        for (var i=0; i<songlist.length; i++) {
            res += '<div class="listalbum-item"><a href="'+songlist[i].h+'" target="_blank"'+songlist[i].link_class +'>'+songlist[i].s+''+songlist[i].c+'</a>'+(songlist[i].a=="" ? '' : ' <div class="comment">('+songlist[i].a+')</div>')+'</div>';
        }
    }
    $('#listAlbum').html(res);
    $('#listAlbum').css('padding-top','15px');
});

$('#az_sort_album').on('click',function(event){
    var sortprop='data-az-album-sort';
    var el = event.currentTarget;
    var el_glyph = $(el).children('span.glyphicon');
    var res='';
    if(el.getAttribute(sortprop)){
        el.setAttribute(sortprop,'');
        el_glyph.removeClass('glyphicon-sort-by-order');
        el_glyph.addClass('glyphicon-sort-by-order-alt');
        for (var i=(albumlist.length-1); i>=0; i--) {
            res += albumlist[i];
        }
    }else{
        el.setAttribute(sortprop,'1');
        el_glyph.removeClass('glyphicon-sort-by-order-alt');
        el_glyph.addClass('glyphicon-sort-by-order');
        for (var i=0; i<albumlist.length; i++) {
            res += albumlist[i];
        }
    }
    res += albumlist_others;
    $('#listAlbum').html(res);
    $('#listAlbum').css('padding-top','0');
});

});
//-->
</script>
</div>
<!-- end of song list -->

<div class="ringtone">
<span id="cf_text_bottom"></span>
</div>


        <form class="search noprint" method="get" action="//search.azlyrics.com/search.php" role="search">
         <div style="margin-bottom:15px" class="input-group">  
		<input type="text" class="form-control" placeholder="" name="q">
       		<span class="input-group-btn">
            	  <button class="btn btn-primary" type="submit"><span class="glyphicon glyphicon-search"></span> Search</button>
          	</span>
 	  </div>   
	</form>

</div> <!-- content -->

<div class="col-lg-2 text-center hidden-md hidden-sm hidden-xs">
   <div class="sky-ad"></div>
</div>
</div>
</div>  <!-- container main-page -->

<!-- nav bottom -->
       <nav class="navbar navbar-default navbar-bottom">
          <div class="container text-center">
          <ul class="nav navbar-nav navbar-center">
            <li><a href="#" onclick="document.forms['addsong'].submit();return false;">Submit Lyrics</a></li>
            <li><a href="//www.stlyrics.com">Soundtracks</a></li>
            <li><a href="//www.facebook.com/pages/AZLyricscom/154139197951223">Facebook</a></li>
            <li><a href="//www.azlyrics.com/contact.html">Contact Us</a></li>
          </ul>
          </div> 
        </nav>

<!-- footer -->
     <nav class="navbar navbar-footer">
          <div class="container text-center">
          <ul class="nav navbar-nav navbar-center">
            <li><a href="//www.azlyrics.com/adv.html">Advertise Here</a></li>
            <li><a href="//www.azlyrics.com/privacy.html">Privacy Policy</a></li>
            <li><a href="//www.azlyrics.com/cookie.html">Cookie Policy</a></li>
            <li><a href="//www.azlyrics.com/copyright.html">DMCA Policy</a></li>
          </ul>
          </div> 
     </nav>
     <div class="footer-wrap">
          <div class="container">
          <small>
             <script type="text/javascript">
                curdate=new Date();
                document.write("<strong>Copyright &copy; 2000-"+curdate.getFullYear()+" AZLyrics.com<\/strong>");
             </script>
          </small>
          </div>
     </div>

<script>
cf_page_artist = ArtistName;
cf_page_song = "";
cf_page_genre = "urban";
cf_no_bit = 0;
</script>
<script src="/local/anew.js"></script>
<script>
cf_adunit_id = "100004759";
</script>
<script src="//srv.tunefindforfans.com/fruits/apricots.js"></script>

    <div id="CssFailCheck" class="hidden" style="height:1px;"></div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="//www.azlyrics.com/local/jquery.min.js"><\/script>')</script>
    <script>
      $(function () {
       if ($('#CssFailCheck').is(':visible') === true) {
         $('<link rel="stylesheet" type="text/css" href="//www.azlyrics.com/bs/css/bootstrap.min.css"><link rel="stylesheet" href="//www.azlyrics.com/bsaz.css">').appendTo('head');
       }
      });
    </script>
    <script src="/local/az.js"></script>
    <script src="/geo.js"></script>
  </body>
</html>
`;

export async function fetchArtistData(url: string) {
  if (
    !/https:\/\/www\.azlyrics\.com\/([a-z]|19)\/([a-z0-9]+)\.html/.test(url)
  ) {
    throw new Error(`Invalid URL: ${url}`);
  }

  // const html = await scrape(url);

  try {
    // const artistData = parseArtistPage(html);
    const artistData = parseArtistPage(mockHTML);
    return artistData;
  } catch (e) {
    console.error(e);
    throw Error(
      `Failed to parse AZLyrics page: ${url}, this song may not exist`
    );
  }
}

export type ArtistData = {
  name: string;
  albums: Array<{
    name: string;
    coverPhotoURL?: string;
    songs: Array<{
      title: string;
      path: string;
    }>;
  }>;
  otherSongs?: Array<{
    title: string;
    path: string;
  }>;
};

function parseArtistPage(html: string): ArtistData {
  const artistData: ArtistData = {
    name: "",
    albums: [],
  };

  const document = new JSDOM(html).window.document;
  const artistName = (document.querySelector("h1>strong")?.textContent ?? "")
    .replace(/\s*[lL]yrics\s*$/, "")
    .trim();

  artistData.name = artistName;

  const albumListElement = document.querySelector("#listAlbum");
  if (!albumListElement) {
    throw new Error("Failed to find album list");
  }

  let currentAlbum: ArtistData["albums"][number] = {
    name: "",
    songs: [],
  };
  for (const div of albumListElement.querySelectorAll(
    "div.listalbum-item,div.album"
  )) {
    if (div.classList.contains("album")) {
      if (currentAlbum.name !== "") {
        artistData.albums.push(currentAlbum);
      }

      const albumName = (div.querySelector("b")?.textContent ?? "")
        .replace(/^"(.+)"$/, "$1")
        .replace(/:$/, "")
        .trim();
      currentAlbum = {
        name: albumName,
        songs: [],
      };

      const albumCoverPhotoPath = div.querySelector("img")?.src;
      if (albumCoverPhotoPath) {
        currentAlbum.coverPhotoURL = `https://www.azlyrics.com${albumCoverPhotoPath}`;
      }
    } else {
      const anchor = div.querySelector("a");
      if (!anchor) continue;

      const songTitle = anchor.textContent?.trim() ?? "";
      const songPath = (anchor.getAttribute("href")?.trim() ?? "").match(
        /\/lyrics\/([a-z0-9]+\/[a-z0-9]+)\.html/
      )?.[1];

      if (!songPath) continue;

      currentAlbum.songs.push({
        title: songTitle,
        path: songPath,
      });
    }
  }
  if (currentAlbum.name === "other songs") {
    artistData.otherSongs = currentAlbum.songs;
  } else {
    artistData.albums.push(currentAlbum);
  }

  return artistData;
}
