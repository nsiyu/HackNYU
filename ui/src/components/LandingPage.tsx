import { Link } from 'react-router-dom'
import metaLogo from '../assets/meta.png' 
import janeStreetLogo from '../assets/janestreet.png'
import nianticLogo from '../assets/niantic.svg'
import hubspotLogo from '../assets/hubspot.png'
import snowflakeLogo from '../assets/snowflake.png'
import { MarketTicker } from './MarketTicker'
import { useState, useEffect } from 'react'
import { 
  ArrowRightIcon, 
  UserGroupIcon,
  GlobeAltIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline'
import zeriVideo from '../assets/Zeri.mp4'

function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [showNav, setShowNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY) {
        setShowNav(false)
      } else {
        setShowNav(true)
      }
      
      setLastScrollY(currentScrollY)
      setScrolled(currentScrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const engineers = [
    { company: 'Meta', logo: metaLogo },
    { company: 'Jane Street', logo: janeStreetLogo },
    { company: 'Niantic', logo: nianticLogo },
    { company: 'HubSpot', logo: hubspotLogo },
    { company: 'Snowflake', logo: snowflakeLogo },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'Radio has transformed how I handle international payments. The integration between crypto and mobile money is seamless.',
      avatar: '/avatars/sarah.jpg',
      icon: UserGroupIcon,
      iconColor: 'bg-primary/10 text-primary group-hover:bg-primary/20'
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Developer',
      content: 'The ability to swap between different currencies instantly has made my work with international clients so much easier.',
      avatar: '/avatars/michael.jpg',
      icon: GlobeAltIcon,
      iconColor: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20'
    },
    {
      name: 'Emma Wilson',
      role: 'Digital Nomad',
      content: 'I travel frequently and Radio has become my go-to platform for managing multiple currencies and making cross-border payments.',
      avatar: '/avatars/emma.jpg',
      icon: CurrencyDollarIcon,
      iconColor: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showNav 
          ? 'transform translate-y-0' 
          : 'transform -translate-y-full'
      } ${
        scrolled ? 'bg-[#0B0E11]/80 backdrop-blur-lg shadow-xl' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="font-display text-2xl font-bold text-primary flex items-center gap-2">
              Radio
            </Link>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-sm hover:text-primary transition-colors">Buy Crypto</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Markets</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Trade</a>
              <a href="#" className="text-sm hover:text-primary transition-colors">Earn</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm px-4 py-2 rounded-lg hover:bg-secondary-light transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="text-sm px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors font-medium">
              Register Now
            </Link>
          </div>
        </div>
      </nav>

      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent animate-pulse" />
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-overlay animate-float"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              background: `radial-gradient(circle, rgba(0,82,255,0.1) 0%, rgba(0,82,255,0) 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Banking Made Accessible
              </span>
              <span className="block mt-2">For Everyone</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              Experience inclusive banking with voice-first technology. Making financial services accessible to all, regardless of ability.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative w-full sm:w-96">
                <input
                  type="email"
                  placeholder=" "
                  className="w-full px-6 py-4 rounded-lg bg-secondary/30 border border-secondary-light focus:border-primary focus:bg-secondary/50 outline-none peer transition-colors pt-6"
                />
                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-all peer-focus:text-xs peer-focus:top-3 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-3">
                  Email/Phone number
                </label>
              </div>
              <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark rounded-lg transition-colors font-medium">
                Start Banking Today
              </button>
            </div>
          </div>

          <div className="text-center animate-slide-up delay-200">
            <div className="text-sm uppercase tracking-wider text-gray-400 mb-8">Built by engineers from</div>
            <div className="flex flex-wrap justify-center items-center gap-12">
              {engineers.map(({ company, logo }) => (
                <div key={company} className="group transition-transform hover:-translate-y-1">
                  <img 
                    src={logo} 
                    alt={company} 
                    className="h-8 w-auto opacity-70 hover:opacity-100 transition-all brightness-0 invert" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-in delay-300">
            <MarketTicker />
          </div>

   
        </div>
      </div>

      {/* Demo Video Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              See Radio in Action
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Watch how easy it is to manage your finances across borders and currencies
            </p>
          </div>
          
          <div className="rounded-xl bg-secondary/30 border border-secondary-light overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <video
                className="absolute top-0 left-0 w-full h-full"
                controls
                autoPlay
                muted
                loop
              >
                <source src={zeriVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Trusted by Users Worldwide
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have simplified their financial lives with Radio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.name}
                className="p-6 rounded-2xl bg-secondary/30 border border-secondary-light hover:border-secondary transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative">
                    <div className={`absolute inset-0 ${testimonial.iconColor} flex items-center justify-center transition-colors`}>
                      <testimonial.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-secondary/20 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Transform Your Banking Experience?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            We're still in closed alpha, and we invite early believers to join us.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark rounded-lg transition-colors font-medium group"
          >
            Join Radio
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      
    </div>
  )
} 

export default LandingPage
