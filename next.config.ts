import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mediapipe/face_mesh",
    "@mediapipe/camera_utils",
  ],
};

export default nextConfig;
