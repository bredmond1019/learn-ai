#!/bin/bash

echo "Testing production contact form..."

curl -X POST https://www.learn-agentic-ai.com/api/contact \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "name": "Brandon Test",
  "email": "bredmond1019@gmail.com",
  "reason": "Congratulations - Contact Form Working!",
  "message": "Your contact form is now fully functional! This test confirms that both the admin notification and user confirmation emails are being sent correctly with the new API key.",
  "honeypot": "",
  "pageLoadTime": $(date +%s)000
}
EOF

echo -e "\n"