"use client";

import { useEffect, useState } from "react";
import VideoCard from "../../../components/VideoCart";

interface Video {
  id: string;
  title: string;
  description?: string;
  publicId: string;
  originalSize: string;
  compressedSize: string;
  duration: number;
  createdAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.mp4`;
    a.click();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-gray-500 text-lg">
        <div className="animate-pulse text-center">
          <p className="text-2xl font-semibold text-blue-600">📺 Loading...</p>
          <p className="text-sm text-gray-400 mt-2">
            Fetching your uploaded videos
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            🎬 Your Uploaded Videos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Watch, download, and manage your videos
          </p>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[60vh] text-center">
            <p className="text-gray-500 text-lg mb-2">
              No videos uploaded yet.
            </p>
            <p className="text-sm text-gray-400">
              Start by uploading your first video!
            </p>
          </div>
        ) : (
          <div
            className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-3 
              gap-8 
              auto-rows-[minmax(280px,_1fr)]
            "
          >
            {videos.map((video) => (
              <div key={video.id} className="flex justify-center">
                <VideoCard video={video} onDownload={handleDownload} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
