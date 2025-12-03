"use client";

import Link from "next/link";
import { BarChart3, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/95 backdrop-blur supports-backdrop-filter:bg-black/60 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Logo + Description */}
          <div className="flex flex-col max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl group mb-4">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                <BarChart3 className="text-white font-bold text-sm w-5 h-5" />
              </div>
              <span className="text-white">Piflepath</span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed">
              A modern on-chain intelligence platform for tracing wallet
              transactions with precision, speed, and complete transparency.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-gray-400 hover:text-white text-sm transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-white text-sm transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-gray-400 hover:text-white text-sm transition">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white text-sm transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-400 hover:text-white text-sm transition">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white text-sm transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white text-sm transition">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Piflepath. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {/* Twitter Icon */}
            <Link
              href="https://x.com"
              className="text-gray-400 hover:text-white transition"
              aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </Link>

            {/* GitHub Icon */}
            <Link
              href="https://github.com"
              className="text-gray-400 hover:text-white transition"
              aria-label="GitHub">
              <Github className="w-5 h-5" />
            </Link>

            {/* Contact Support (text link stays) */}
            <Link
              href="mailto:support@piflepath.com"
              className="text-gray-400 hover:text-white text-sm transition">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
