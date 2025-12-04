"use client"
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          About{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">Pifflepath</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Empowering traders and developers with real-time analytics, intelligent alerts, and comprehensive token
          tracking.
        </p>

        <div className="mt-12 space-y-12">
          {/* Mission */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              Pifflepath is built to democratize access to professional-grade Blockchain analytics. We believe that
              every trader and developer should have the tools to make informed decisions in the fast-paced world of
              cryptocurrency. Our platform bridges the gap between complex blockchain data and actionable insights.
            </p>
          </div>

          {/* What We Do */}
          <div>
            <h2 className="text-2xl font-bold mb-3">What We Do</h2>
            <p className="text-gray-400 leading-relaxed mb-4">Pifflepath provides a comprehensive suite of tools:</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-orange-500 mb-2">Real-Time Token Tracking</h3>
                <p className="text-gray-400 text-sm">
                  Monitor price movements, volume changes, and market metrics across thousands of tokens with
                  millisecond precision.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-500 mb-2">Intelligent Alerts</h3>
                <p className="text-gray-400 text-sm">
                  Set custom alerts for price thresholds, volume spikes, liquidity changes, and more. Never miss a
                  critical market movement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-500 mb-2">Advanced Analytics</h3>
                <p className="text-gray-400 text-sm">
                  Access detailed charts, historical data, holder analytics, and trading patterns to make data-driven
                  decisions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-500 mb-2">Developer SDK</h3>
                <p className="text-gray-400 text-sm">
                  Integrate Pifflepath's powerful analytics into your own applications with our easy-to-use SDK and
                  comprehensive API.
                </p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Built on Blockchain</h2>
            <p className="text-gray-400 leading-relaxed">
              We chose blockchain technology for its unmatched speed and low transaction costs. Our infrastructure
              leverages blockchain's high-performance capabilities to deliver real-time data processing and analytics
              that keep pace with the market. By building natively on blockchain networks, we ensure our users have the
              fastest and most accurate data available.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-400 text-sm">
                  Sub-second data updates ensuring you're always ahead of the market.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-gray-400 text-sm">Enterprise-grade security with 99.9% uptime guarantee.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">Comprehensive Data</h3>
                <p className="text-gray-400 text-sm">
                  Track thousands of tokens with detailed metrics and historical data.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">🛠️</div>
                <h3 className="font-semibold mb-2">Developer Friendly</h3>
                <p className="text-gray-400 text-sm">Clean API, detailed docs, and responsive support for builders.</p>
              </div>
            </div>
          </div>

          {/* Who It's For */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Who Uses Pifflepath</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Pifflepath serves a diverse community of blockchain enthusiasts:
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 mt-1">▸</span>
                <span>
                  <strong className="text-white">Day Traders</strong> who need real-time alerts and rapid market
                  insights
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 mt-1">▸</span>
                <span>
                  <strong className="text-white">Developers</strong> building blockchain applications and need reliable
                  data feeds
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 mt-1">▸</span>
                <span>
                  <strong className="text-white">Portfolio Managers</strong> tracking multiple tokens and managing risk
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 mt-1">▸</span>
                <span>
                  <strong className="text-white">Researchers</strong> analyzing market trends and token performance
                </span>
              </li>
            </ul>
          </div>

          {/* Vision */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              We envision a future where cryptocurrency trading and development are transparent, accessible, and
              data-driven. Pifflepath is committed to continuous innovation, expanding our analytics capabilities, and
              supporting the growth of blockchain ecosystems. Join us as we build the next generation of blockchain
              analytics tools.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="bg-linear-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Get Started Today</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Join thousands of traders and developers who trust Pifflepath for their analytics needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition">
                Start Free Trial
              </button>
              <button className="bg-white/5 border border-white/10 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
