import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Le package db est en TypeScript source (imports `.ts`) → transpilé par Next.
  transpilePackages: ["@open-hemicycle/db"],
  // `postgres` (driver) reste externe au bundle serveur (accès node:net, etc.).
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
