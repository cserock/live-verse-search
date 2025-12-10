import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.0.13',
  ],
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // 서버 사이드에서 better-sqlite3를 외부 모듈로 처리
  //     config.externals.push('better-sqlite3');
  //   }
  //   return config;
  // },
};

export default nextConfig;
