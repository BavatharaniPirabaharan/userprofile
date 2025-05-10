import React from 'react';
import ui from '../ui.jpg';
import { Link } from 'react-router-dom';

const HomeWelcome = () => {
  const features = [
    {
      title: "Expense Tracking",
      icon: "💰",
      description: "Monitor all expenses with smart categorization and real-time updates",
      features: ["Automated categorization", "Receipt scanning", "Spending alerts"]
    },
    {
      title: "Income Management",
      icon: "📈",
      description: "Track all income sources with detailed analytics",
      features: ["Multiple income streams", "Tax-ready reports", "Forecasting tools"]
    },
    {
      title: "Financial Reports",
      icon: "📊",
      description: "Generate comprehensive reports with one click",
      features: ["Custom templates", "Visual dashboards", "Export to PDF/Excel"]
    },
    {
      title: "Tax Preparation",
      icon: "🧾",
      description: "Simplify tax season with automated calculations",
      features: ["Deduction finder", "Tax estimate calculator", "Year-round tracking"]
    },
    {
      title: "Budget Planning",
      icon: "📅",
      description: "Create and maintain budgets effortlessly",
      features: ["Custom categories", "Progress tracking", "Savings goals"]
    },
    {
      title: "Multi-Device Sync",
      icon: "🔄",
      description: "Access your data anywhere, anytime",
      features: ["Cloud backup", "Mobile app", "Real-time updates"]
    }
  ];

  const footerLinks = {
    services: ['Accounting', 'Tax Preparation', 'Financial Planning', 'Business Consulting'],
    company: ['About us', 'Contact', 'Careers', 'Press'],
    legal: ['Terms of use', 'Privacy policy', 'Cookie policy']
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <a className="text-2xl font-bold text-white hover:text-blue-200 transition-colors">Axento</a>
          </div>
          <div>
          <Link to='/login'>
          <button className="px-6 py-2 bg-white text-blue-900 font-medium rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
              Login
            </button></Link> 
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div 
          className="relative min-h-[70vh] flex items-center justify-center"
          style={{
            backgroundImage: `url(${ui})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <div className="absolute inset-0 bg-blue-900 opacity-70"></div>
          <div className="relative z-10 px-4 py-16 text-center max-w-4xl mx-auto">
            <h1 className="mb-6 text-4xl md:text-5xl font-bold text-white leading-tight">
              Smart Financial Management Made Simple
            </h1>
            <p className="mb-8 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Take complete control of your finances with our powerful accounting tools. 
              Track income, expenses, and get insightful reports to grow your business efficiently.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-100 transition-colors shadow-md">
                Get Started - Its Free
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
                See How It Works
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Powerful Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your finances effectively in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className="p-6">
                    <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-center mb-3 text-blue-900">{feature.title}</h3>
                    <p className="mb-4 text-gray-700 text-center">{feature.description}</p>
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 text-blue-800 border-b border-blue-100 pb-2">Includes:</h4>
                      <ul className="space-y-2">
                        {feature.features.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-1">✓</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20 text-center">
              <h3 className="text-2xl font-semibold text-blue-900 mb-6">Ready to transform your finances?</h3>
              <button className="px-10 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg">
                Start Your 30-Day Free Trial
              </button>
              <p className="mt-4 text-gray-600">No credit card required</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">What Our Users Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "This accounting software saved me 10+ hours per week on financial management.",
                  author: "Vijay",
                  role: "Business Owner"
                },
                {
                  quote: "The reporting features helped us identify $15k in unnecessary expenses last quarter.",
                  author: "TVK",
                  role: "Tech Startup"
                },
                {
                  quote: "Finally, accounting software that's powerful yet easy to use for non-accountants.",
                  author: "KIT",
                  role: "Freelancer"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                  <div className="font-semibold text-blue-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Axento</h3>
              <p className="mb-6 text-blue-200">
                Powerful financial tools to help you grow your business and manage your money effectively.
              </p>
              <div className="flex gap-4">
                {['facebook-f', 'twitter', 'linkedin-in', 'instagram'].map((icon) => (
                  <a key={icon} className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <i className={`fab fa-${icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
            
            {Object.entries(footerLinks).map(([category, items]) => (
              <div key={category}>
                <h6 className="text-lg font-semibold mb-4 capitalize">{category}</h6>
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i}>
                      <a className="text-blue-200 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-blue-800 my-8"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200">© {new Date().getFullYear()} Smart Accounting. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a>
              <a className="text-blue-200 hover:text-white transition-colors">Terms of Service</a>
              <a className="text-blue-200 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeWelcome;