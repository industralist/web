"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Agreement to Terms",
      content:
        "By accessing and using Pifflepath, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "2. Use License",
      content:
        "Permission is granted to temporarily download one copy of the materials (information or software) on Pifflepath for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n\n• Modify or copy the materials\n• Use the materials for any commercial purpose or for any public display\n• Attempt to decompile or reverse engineer any software contained on the platform\n• Remove any copyright or other proprietary notations from the materials\n• Transfer the materials to another person or 'mirror' the materials on any other server",
    },
    {
      title: "3. Disclaimer",
      content:
        "The materials on Pifflepath are provided on an 'as is' basis. Pifflepath makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
    },
    {
      title: "4. Limitations",
      content:
        "In no event shall Pifflepath or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pifflepath, even if Pifflepath or an authorized representative has been notified orally or in writing of the possibility of such damage.",
    },
    {
      title: "5. Accuracy of Materials",
      content:
        "The materials appearing on Pifflepath could include technical, typographical, or photographic errors. Pifflepath does not warrant that any of the materials on its website are accurate, complete, or current. Pifflepath may make changes to the materials contained on its website at any time without notice.",
    },
    {
      title: "6. Links",
      content:
        "Pifflepath has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Pifflepath of the site. Use of any such linked website is at the user's own risk.",
    },
    {
      title: "7. Modifications",
      content:
        "Pifflepath may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
    },
    {
      title: "8. Governing Law",
      content:
        "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Pifflepath operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
    },
    {
      title: "9. API Usage",
      content:
        "If you use our API, you agree to:\n\n• Use the API only for authorized purposes\n• Not exceed rate limits or attempt to bypass security measures\n• Not use the API to scrape or distribute data without permission\n• Comply with all applicable laws and regulations\n• Not use the API for any illegal or unauthorized purpose",
    },
    {
      title: "10. Wallet Security",
      content:
        "You are responsible for the security of your wallet and API keys. Pifflepath is not responsible for any unauthorized access to your account or any damages resulting from your failure to maintain the confidentiality of your credentials.",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Last updated: December 2024</p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-semibold text-primary">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-6 bg-card border border-border rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Questions about our Terms?</h3>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <a href="mailto:legal@pifflepath.com" className="text-primary hover:text-primary/80 transition">
            legal@pifflepath.com
          </a>
        </motion.div>
      </div>
    </main>
  )
}
