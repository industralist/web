"use client";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-20 container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Piflepath{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">
            Documentation
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Learn how to integrate, use, and optimize Piflepath for your Blockchain
          analytics workflows.
        </p>

        <div className="mt-12 space-y-12">
          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold mb-3">1. Getting Started</h2>
            <p className="text-gray-400 leading-relaxed">
              Piflepath allows developers and traders to monitor tokens,
              view analytics, and receive alerts. This guide will walk you
              through setup and usage.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold mb-3">2. Installation</h2>
            <p className="text-gray-400 mb-2">Install via NPM:</p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <pre className="text-gray-200 text-sm">
                npm install piflepath-sdk
              </pre>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold mb-3">3. Basic Usage</h2>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <pre className="text-gray-200 text-sm">
                {`import { trackToken } from "piflepath-sdk";

const data = await trackToken("SOL");
console.log(data);`}
              </pre>
            </div>

            <p className="text-gray-400 mt-3">
              Use{" "}
              <span className="text-orange-500 font-semibold">
                trackToken()
              </span>{" "}
              to fetch real-time token metrics.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold mb-3">4. Alerts</h2>
            <p className="text-gray-400 leading-relaxed">
              Set alerts to monitor price movements and receive real-time
              notifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
