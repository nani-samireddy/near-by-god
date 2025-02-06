import { promises as fs } from "fs";
import path from "path";

type Song = {
  telugu_title: string;
  english_title: string;
  telugu_lyrics: string;
  english_lyrics: string;
  youtubeId?: string;
};

type SongsDataType = {
  [key: string]: Song;
};

// Function to dynamically load JSON based on language
async function getSongsData(language: string): Promise<SongsDataType> {
  try {
    const filePath = path.join(process.cwd(), "data", language, "data.json");
    const jsonData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error loading songs data:", error);
    return {}; // Return an empty object if the file is not found or invalid
  }
}

export default async function SongPage({ params }: { params: Promise<{ language: string; songSlug: string }> }) {
  const { language, songSlug } = await Promise.resolve(params); // Ensure params are awaited

  const songsData = await getSongsData(language);
  const song = songsData[songSlug];

  if (!song) {
    return <div>Not found</div>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-start justify-items-start md:justify-items-center min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-10 row-start-2 items-center sm:items-start">
        {song.youtubeId && (
          <div className="iframe-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${song.youtubeId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div className="flex flex-col items-start justify-start gap-10">
          <div className="telugu">
            <h1 className="font-black text-4xl my-6">{song.telugu_title}</h1>
            <pre className=" whitespace-pre-wrap leading-10">{song.telugu_lyrics}</pre>
          </div>
          <div className="english">
            <h1 className="font-black text-4xl my-6">{song.english_title}</h1>
            <pre className="whitespace-pre-wrap leading-9">{song.english_lyrics}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}

// Generate static paths
export async function generateStaticParams() {
  try {
    const languages = ["telugu", "english"]; // Add more supported languages
  const paths: { language: string; songSlug: string }[] = [];

  for (const language of languages) {
    const songsData = await getSongsData(language);
    Object.keys(songsData).forEach((songSlug) => {
      paths.push({ language, songSlug });
    });
  }

  return paths;
  } catch (error) {
    console.error("Error loading songs data:", error);
    return [];
  }
}

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ language: string; songSlug: string }> }) {
  const { language, songSlug } = await Promise.resolve(params);

  const songsData = await getSongsData(language);
  const song = songsData[songSlug];

  if (!song) {
    return {
      title: "Song Not Found - Near By GOD",
      description: "The requested song was not found. Browse through our collection of Telugu Christian songs.",
    };
  }

  return {
    title: `${song.telugu_title} - Near By GOD`,
    description: `Lyrics for ${song.telugu_title} (${song.english_title}). Browse more Telugu Christian songs on Near By GOD.`,
    keywords: [song.telugu_title, song.english_title, "Telugu Christian songs", "Telugu lyrics", "Near By GOD"],
    openGraph: {
      title: `${song.telugu_title} - Near By GOD`,
      description: `Read the lyrics for ${song.telugu_title} in Telugu and English. Watch the video and enjoy!`,
      url: `https://nani-samireddy.github.io/nbg/songs/${language}/${songSlug}`,
      images: [
        {
          url: `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`,
          width: 1200,
          height: 630,
          alt: `${song.telugu_title} - Song Thumbnail`,
        },
      ],
    },
  };
}
