/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@findawardticket/core", "@findawardticket/airports-data"],
};

export default nextConfig;
