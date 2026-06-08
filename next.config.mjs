/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site in `out/` so it can be hosted for free on
  // Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
