/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/free-products.html', destination: 'https://kuntanaturals.com/free-products.html', permanent: false },
      { source: '/digital-products.html', destination: 'https://kuntanaturals.com/digital-products.html', permanent: false },
      { source: '/email-signup.html', destination: 'https://kuntanaturals.com/email-signup.html', permanent: false },
      { source: '/checkout.html', destination: 'https://kuntanaturals.com/checkout.html', permanent: false },
      { source: '/thank-you.html', destination: 'https://kuntanaturals.com/thank-you.html', permanent: false },
      { source: '/downloads/:path*', destination: 'https://kuntanaturals.com/downloads/:path*', permanent: false },
      { source: '/products/:path*', destination: 'https://kuntanaturals.com/products/:path*', permanent: false }
    ];
  }
};

export default nextConfig;
