import { Metadata } from 'next'
import { Container } from '@/components/Container'
import { Section } from '@/components/Section'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Brandon - AI Engineer',
  description: 'Get in touch with me for AI engineering projects, collaborations, or opportunities.',
}

export default function ContactPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.pageLoadStart = Date.now();`
        }}
      />
      <div>
      <Section spacing="lg">
        <Container size="lg">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-100 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              I&apos;m always interested in hearing about new AI engineering opportunities, 
              collaboration ideas, or interesting projects. Feel free to reach out!
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <ContactForm />
              </div>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                    Let&apos;s Connect
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Whether you have a project in mind, need AI consulting, or just want 
                    to discuss the latest in machine learning and AI engineering, I&apos;d love 
                    to hear from you.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">
                    What I Can Help With
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span>AI/ML model development and deployment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span>LLM integration and prompt engineering</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span>AI-powered application architecture</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span>Data pipeline optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span>Technical consulting and mentoring</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    Response Time
                  </h3>
                  <p className="text-gray-300">
                    I typically respond to inquiries within 24-48 hours. For urgent matters, 
                    please mention it in your message.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      </div>
    </>
  )
}