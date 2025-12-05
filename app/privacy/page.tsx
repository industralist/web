"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "Pifflepath ('we', 'us', 'our', or 'Company') operates the Pifflepath blockchain intelligence platform. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.",
    },
    {
      title: "2. Information Collection and Use",
      content:
        "We collect several different types of information for various purposes to provide and improve our service to you:\n\n• Wallet Address: When you connect your Solana wallet, we collect your public wallet address for transaction tracking and analysis.\n\n• API Keys: If you create an API key, we store this securely to authenticate your API requests.\n\n• Usage Data: We automatically collect information about how you interact with our platform, including IP address, browser type, pages visited, and time spent.\n\n• Cookies: We use cookies and similar technologies to track activity on our platform and hold certain information.",
    },
    {
      title: "3. Data Security",
      content:
        "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.",
    },
    {
      title: "4. Data Retention",
      content:
        "Pifflepath will retain your personal data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your personal data to the extent necessary to comply with our legal obligations.",
    },
    {
      title: "5. Third-Party Services",
      content:
        "Our platform integrates with third-party services including Solana blockchain infrastructure and RPC providers. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.",
    },
    {
      title: "6. GDPR Compliance",
      content:
        "If you are a resident of the European Economic Area (EEA), you have certain data protection rights under GDPR. These include the right to access, correct, or delete your personal data, as well as the right to restrict processing or to object to processing.",
    },
    {
      title: "7. Changes to This Privacy Policy",
      content:
        "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last updated' date at the bottom of this page.",
    },
    {
      title: "8. Contact Us",
      content:
        "If you have any questions about this Privacy Policy, please contact us at privacy@pifflepath.com or visit our support page on our website.",
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
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
          transition={{ delay: 0.4 }}
          className="mt-16 p-6 bg-card border border-border rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Questions?</h3>
          <p className="text-muted-foreground mb-4">
            If you have any privacy concerns or questions, please reach out to us:
          </p>
          <a href="mailto:privacy@pifflepath.com" className="text-primary hover:text-primary/80 transition">
            privacy@pifflepath.com
          </a>
        </motion.div>
      </div>
    </main>
  )
}
