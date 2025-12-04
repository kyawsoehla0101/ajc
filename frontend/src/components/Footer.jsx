import { Facebook, Twitter } from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  // navlink in the footer
  const footerLinks = [
    {
      title: "Jobseeker",
      links: ["Login", "Register", "Jobs Search", "Saved Jobs"],
      path: ["/login", "/register", "/jobs-search", "/saved-jobs"],
    },
    {
      title: "Employer",
      links: ["Employer Account", "Post a Job", "Product & Prices"],
      path: ["/employer-account", "/post-job", "/product-prices"],
    },
    {
      title: "About My Jobs",
      links: ["Overview", "About Us", "Contact My Jobs", "Privacy Policy"],
      path: ["/overview", "/about-us", "/contact", "/privacy-policy"],
    },
    {
      title: "Contact",
      links: ["Contact Us"],
      path: ["/contact-us"],
    },
  ];

  // social link in the footer
  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook size={20} color="#1877F2" />,
      url: "#",
    },
    {
      name: "Twitter",
      icon: <Twitter size={20} color="#1DA1F2" />,
      url: "#",
    },
    {
      name: "Telegram",
      icon: <FaTelegramPlane size={20} color="#0088cc" />,
      url: "#",
    },
  ];

  return (
    <footer className="bg-gray-100 py-6 max-2xl:py-4">
      <div className="container mx-auto px-4 text-sm gray-text-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Looped navlink */}
          {footerLinks.map((section, sidx) => (
            <div key={sidx} className="flex flex-col justify-between h-full">
              <div>
                <h4 className="font-bold mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, idx) => {
                    const toPath = section.path?.[idx] || "#";
                    return (
                      <li key={idx}>
                        {toPath !== "#" ? (
                          <Link to={toPath} className="hover:underline">
                            {link}
                          </Link>
                        ) : (
                          <a href={toPath} className="hover:underline">
                            {link}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Looped navlink */}
              {section.title === "Contact" && (
                <div className="mt-4 sm:mt-6 flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a key={index} href={social.url} aria-label={social.name}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8 gray-text-custom">
          &copy; {new Date().getFullYear()} Jobseeker - All rights reserved.
        </div>
      </div>
    </footer>
  );
}
