/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
  },
  eslint: {
    // 병렬 개발 단계에서 lint가 빌드를 막지 않도록. 정식 출시 전 해제.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
