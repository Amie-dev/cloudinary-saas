/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import axios from "axios";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080 },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350 },
  "Instagram Story/Reel (9:16)": { width: 1080, height: 1920 },

  "Twitter/X Post (16:9)": { width: 1200, height: 675 },
  "Twitter/X Post (1:1)": { width: 1200, height: 1200 },
  "Twitter/X Header": { width: 1500, height: 500 },

  "Facebook Post (1.91:1)": { width: 1200, height: 630 },
  "Facebook Square (1:1)": { width: 1080, height: 1080 },
  "Facebook Cover": { width: 820, height: 312 },

  "LinkedIn Post (1.91:1)": { width: 1200, height: 628 },
  "LinkedIn Cover": { width: 1584, height: 396 },

  "YouTube Thumbnail": { width: 1280, height: 720 },
  "YouTube Channel Art": { width: 2560, height: 1440 },
};

type SocialFormatKey = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormatKey>(
    "Instagram Square (1:1)"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  // Spinner should trigger when format changes
  useEffect(() => {
    if (uploadImage) {
      setIsTransforming(true);
      const timeout = setTimeout(() => setIsTransforming(false), 3000); // fallback
      return () => clearTimeout(timeout);
    }
  }, [selectedFormat, uploadImage]);

  // ✅ Handle File Upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/image-upload", formData);
      if (response.status === 200) {
        setUploadImage(response.data.public_id); // ✅ Use public_id, not full URL
        setMessage("Upload successful!");
      } else {
        setMessage("Upload failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Image upload error");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Handle Image Download
  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "social-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Social Media Image Creator
      </h1>

      {/* File Upload */}
      <div className="mb-4 w-full max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose an image file
        </label>
        <input
          type="file"
          onChange={handleFileUpload}
          className="file-input file-input-bordered w-full"
        />
      </div>

      {isUploading && (
        <div className="w-full max-w-md mb-4">
          <progress className="progress progress-primary w-full"></progress>
        </div>
      )}

      {message && (
        <div className="mb-4 text-center text-sm text-green-600 font-medium">
          {message}
        </div>
      )}

      {/* ✅ Format Selection + Preview */}
      {uploadImage && (
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Select Social Media Format
          </h2>
          <select
            className="select select-bordered w-full mb-6"
            value={selectedFormat}
            onChange={(e) =>
              setSelectedFormat(e.target.value as SocialFormatKey)
            }
          >
            {Object.keys(socialFormats).map((format) => (
              <option value={format} key={format}>
                {format}
              </option>
            ))}
          </select>

          <h3 className="text-md font-semibold mb-2">Preview</h3>
          <div className="flex justify-center items-center border rounded-lg p-4 bg-gray-50 mb-6 min-h-[200px]">
            {isTransforming ? (
              <span className="loading loading-spinner loading-lg text-blue-500"></span>
            ) : (
              <CldImage
                key={`${uploadImage}-${selectedFormat}`} // 👈 forces re-render
                width={socialFormats[selectedFormat].width}
                height={socialFormats[selectedFormat].height}
                src={uploadImage}
                alt="Transformed image"
                crop="fill"
                gravity="auto"
                className="rounded-md shadow-md"
                onLoad={() => setIsTransforming(false)}
                ref={imageRef}
              />
            )}
          </div>

          <div className="flex justify-center">
            <button onClick={handleDownload} className="btn btn-primary">
              Download for {selectedFormat}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
