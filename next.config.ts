import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mediapipe/face_mesh", "@mediapipe/camera_utils"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
