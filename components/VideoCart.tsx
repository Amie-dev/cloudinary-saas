"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Download, FileDown, FileUp, Clock, X, Play } from "lucide-react";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

export interface Video {
  id: string;
  title: string;
  description?: string;
  publicId: string;
  originalSize: string;
  compressedSize: string;
  duration: number;
  createdAt: string;
}

interface VideoCardProps {
  video: Video;
    onDownload?: (url: string, title: string) => void; // ✅ Add this line

}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null); // ✅ Video reference
  const route=useRouter()
  const getThumbnailUrl = useCallback(
    (publicId: string) =>
      getCldImageUrl({
        src: publicId,
        width: 520,
        height: 140,
        crop: "fill",
        gravity: "auto",
        format: "jpg",
        quality: "auto",
        assetType: "video",
      }),
    []
  );

  const getFullVideoUrl = useCallback(
    (publicId: string) =>
      getCldVideoUrl({
        src: publicId,
        width: 1920,
        height: 1080,
      }),
    []
  );

  const getPreviewVideoUrl = useCallback(
    (publicId: string) =>
      getCldVideoUrl({
        src: publicId,
        width: 520,
        height: 140,
        rawTransformations: ["e_preview:duration_15s:max_seg_9:min_seg_dur_1"],
      }),
    []
  );

  const formatSize = (size: number) => filesize(size);
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
  );

  useEffect(() => setPreviewError(false), [isHovered]);

  // ✅ Smooth Secure Download
  const handleSecureDownload = async () => {
    setIsDownloading(true);
    try {
      const videoUrl = getFullVideoUrl(video.publicId);
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${video.title || "video"}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      alert("⚠️ Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ Close Watch Modal and stop video
  const handleCloseWatch = () => {
    
    setIsWatching(false);
    route.push("/")
    console.log("Working")
  };

  return (
    <>
      {/* 🔹 Video Card */}
      <div
        className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-[520px] overflow-hidden flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <figure className="relative w-full h-[120px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {isHovered && !previewError ? (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setPreviewError(true)}
              className="w-full h-full object-cover scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src={getThumbnailUrl(video.publicId)}
              alt={video.title}
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-300"
            />
          )}

          {/* Duration Tag */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm">
            <Clock size={12} />
            <span>{formatDuration(video.duration)}</span>
          </div>
        </figure>

        {/* 🔹 Content Section */}
        <div className="p-4 flex flex-col flex-1">
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100 line-clamp-2">
            {video.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {video.description || "No description provided."}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Uploaded {dayjs(video.createdAt).fromNow()}
          </p>

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
              <FileUp size={14} />
              <span>{formatSize(Number(video.originalSize))}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
              <FileDown size={14} />
              <span>{formatSize(Number(video.compressedSize))}</span>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t flex justify-between items-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Compression:{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {compressionPercentage}%
              </span>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setIsWatching(true)}
                className="flex items-center gap-1 bg-gray-800 hover:bg-black text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
              >
                <Play size={14} />
                Watch
              </button>

              <button
                onClick={handleSecureDownload}
                disabled={isDownloading}
                className={`flex items-center gap-1 ${
                  isDownloading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white px-3 py-1 rounded-full text-xs font-medium transition-colors`}
              >
                <Download size={16} />
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Watch Modal */}
      {isWatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl">
            {/* ❌ Close button */}
            <button
              onClick={handleCloseWatch}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/100 text-white rounded-full p-2 transition"
            >
              <X size={20} />
            </button>

            <video
              ref={videoRef}
              src={getFullVideoUrl(video.publicId)}
              controls
              autoPlay
              className="w-full h-[480px] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;
